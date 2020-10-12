import { Village, VillageSettings } from '../Core/Village';
import { Resources } from '../Core/Resources';
import { VillageStorage } from '../Storage/VillageStorage';
import { calcGatheringTimings, GatheringTime } from '../Core/GatheringTimings';
import { OrderedProductionQueues, ProductionQueue } from '../Core/ProductionQueue';
import { Args } from '../Queue/Args';
import { timestamp } from '../Helpers/Time';
import { isInQueue, TaskCore } from '../Queue/Task';
import { TaskId } from '../Queue/TaskId';

export interface TaskState {
    id: TaskId;
    name: string;
    args: Args;
    isEnoughWarehouseCapacity: boolean;
    isEnoughGranaryCapacity: boolean;
    canBeBuilt: boolean;
}

export interface TaskQueueState {
    queue: ProductionQueue;
    tasks: ReadonlyArray<TaskState>;
    finishTs: number;
}

interface VillageProductionQueueState {
    queue: ProductionQueue;
    tasks: ReadonlyArray<TaskState>;
    isActive: boolean;
    isWaiting: boolean;
    currentTaskFinishTimestamp: number;
    currentTaskFinishSeconds: number;
    firstTask: ResourceLineState;
    allTasks: ResourceLineState;
    taskCount: number;
}

interface VillageWarehouseState {
    resources: Resources;
    capacity: Resources;
    balance: Resources;
    performance: Resources;
    timeToZero: GatheringTime;
    timeToFull: GatheringTime;
    optimumFullness: Resources;
    criticalFullness: Resources;
    isOverflowing: boolean;
}

/**
 * State of one or more tasks, which required some resources.
 */
interface ResourceLineState {
    /**
     * Required resources (always positive)
     */
    resources: Resources;
    /**
     * Balance resources (current - required, may be negative)
     */
    balance: Resources;
    /**
     * Time to gather all type of resources (slowest time)
     */
    time: GatheringTime;
    /**
     * Is active - resources not equals to zero.
     */
    active: boolean;
}

export interface VillageState {
    /**
     * Village id
     */
    id: number;
    /**
     * Village object
     */
    village: Village;
    /**
     * Current village resources
     */
    resources: Resources;
    performance: Resources;
    warehouse: VillageWarehouseState;
    queues: Array<VillageProductionQueueState>;
    tasks: Array<TaskState>;
    firstReadyTask: TaskState | undefined;
    /**
     * Required resources for nearest task
     */
    required: ResourceLineState;
    incomingResources: Resources;
    settings: VillageSettings;
}

function makeResourceState(
    resources: Resources,
    current: Resources,
    performance: Resources
): ResourceLineState {
    return {
        resources,
        balance: current.sub(resources),
        time: timeToAllResources(current, resources, performance),
        active: !resources.empty(),
    };
}

function makeWarehouseState(
    resources: Resources,
    capacity: Resources,
    performance: Resources
): VillageWarehouseState {
    // @fixme Если у героя большая добыча ресурсов, а склад маленький, то значения получаются тож маленькими
    // @fixme с одной деревней это не прокатывает, и даже не построить склад
    // const optimumFullness = capacity.sub(performance.scale(3));
    // const criticalFullness = capacity.sub(performance.scale(1));
    const optimumFullness = capacity.scale(0.9);
    const criticalFullness = capacity.scale(0.98);
    return {
        resources,
        capacity,
        performance,
        balance: capacity.sub(resources),
        timeToZero: timeToFastestResource(resources, Resources.zero(), performance),
        timeToFull: timeToFastestResource(resources, capacity, performance),
        optimumFullness: optimumFullness,
        criticalFullness: criticalFullness,
        isOverflowing: criticalFullness.anyLower(resources),
    };
}

function timeToAllResources(
    current: Resources,
    desired: Resources,
    performance: Resources
): GatheringTime {
    const timings = calcGatheringTimings(current, desired, performance);
    return timings.slowest;
}

function timeToFastestResource(
    current: Resources,
    desired: Resources,
    performance: Resources
): GatheringTime {
    const timings = calcGatheringTimings(current, desired, performance);
    return timings.fastest;
}

function calcIncomingResources(storage: VillageStorage): Resources {
    return storage.getIncomingMerchants().reduce((m, i) => m.add(i.resources), Resources.zero());
}

function createProductionQueueState(
    taskQueueState: TaskQueueState,
    storage: VillageWarehouseState
): VillageProductionQueueState {
    const queue = taskQueueState.queue;
    const tasks = taskQueueState.tasks;
    const taskEndingTimestamp = taskQueueState.finishTs;
    const resources = storage.resources;
    const performance = storage.performance;
    const firstTaskResources = tasks.slice(0, 1).reduce(taskResourceReducer, Resources.zero());
    const allTaskResources = tasks.reduce(taskResourceReducer, Resources.zero());

    const currentTimestamp = timestamp();

    return {
        queue,
        tasks,
        isActive: tasks.length !== 0 || taskEndingTimestamp > currentTimestamp,
        isWaiting: tasks.length !== 0 && taskEndingTimestamp < currentTimestamp,
        currentTaskFinishTimestamp: taskEndingTimestamp,
        currentTaskFinishSeconds: Math.max(
            taskEndingTimestamp ? taskEndingTimestamp - currentTimestamp : 0,
            0
        ),
        firstTask: makeResourceState(firstTaskResources, resources, performance),
        allTasks: makeResourceState(allTaskResources, resources, performance),
        taskCount: tasks.length,
    };
}

function getGroupedByQueueTasks(
    tasks: ReadonlyArray<TaskState>,
    storage: VillageStorage
): Array<TaskQueueState> {
    const result: Array<TaskQueueState> = [];
    for (let queue of OrderedProductionQueues) {
        result.push({
            queue,
            tasks: tasks.filter(isInQueue(queue)),
            finishTs: storage.getQueueTaskEnding(queue),
        });
    }
    return result;
}

function createTaskQueueStates(
    warehouse: VillageWarehouseState,
    tasks: ReadonlyArray<TaskState>,
    storage: VillageStorage
) {
    let result: Array<VillageProductionQueueState> = [];
    const possibleTasks = tasks.filter((task) => task.canBeBuilt);
    for (let taskQueueInfo of getGroupedByQueueTasks(possibleTasks, storage)) {
        result.push(createProductionQueueState(taskQueueInfo, warehouse));
    }
    return result;
}

function getReadyForProductionTask(
    queues: ReadonlyArray<VillageProductionQueueState>
): TaskState | undefined {
    const firstReadyQueue = queues.find((queue) => queue.isWaiting);
    if (!firstReadyQueue) {
        return undefined;
    }

    return firstReadyQueue.tasks.find((task) => task.canBeBuilt);
}

function getTaskResources(task: TaskCore | undefined): Resources {
    if (task && task.args.resources) {
        return Resources.fromObject(task.args.resources);
    }
    return Resources.zero();
}

function taskResourceReducer(resources: Resources, task: TaskCore) {
    return task.args.resources
        ? resources.add(Resources.fromObject(task.args.resources))
        : resources;
}

function makeTaskState(task: TaskCore, maxResourcesForTask: Resources): TaskState {
    const taskResources = getTaskResources(task);
    const isEnoughWarehouseCapacity = maxResourcesForTask.allGreaterOrEqual(
        new Resources(taskResources.lumber, taskResources.clay, taskResources.iron, 0)
    );
    const isEnoughGranaryCapacity = maxResourcesForTask.allGreaterOrEqual(
        new Resources(0, 0, 0, taskResources.crop)
    );

    const canBeBuilt = isEnoughWarehouseCapacity && isEnoughGranaryCapacity;

    return {
        id: task.id,
        args: task.args,
        name: task.name,
        isEnoughWarehouseCapacity,
        isEnoughGranaryCapacity,
        canBeBuilt,
    };
}

function createVillageState(village: Village, storage: VillageStorage): VillageState {
    const settings = storage.getSettings();
    const resources = storage.getResources();
    const capacity = storage.getWarehouseCapacity();
    const performance = storage.getResourcesPerformance();
    const storageState = makeWarehouseState(resources, capacity, performance);
    const tasks = storage.getTasks().map((t) => makeTaskState(t, storageState.optimumFullness));
    const queues = createTaskQueueStates(storageState, tasks, storage);
    const firstReadyTask = getReadyForProductionTask(queues);
    const requiredResources = getTaskResources(firstReadyTask);
    return {
        id: village.id,
        village,
        resources,
        performance,
        warehouse: storageState,
        required: makeResourceState(requiredResources, resources, performance),
        tasks,
        queues,
        firstReadyTask,
        incomingResources: calcIncomingResources(storage),
        settings,
    };
}

export class VillageStateFactory {
    getVillageState(village: Village, storage: VillageStorage): VillageState {
        return createVillageState(village, storage);
    }
}
