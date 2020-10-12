import { Village, VillageSettings } from '../Core/Village';
import { Resources } from '../Core/Resources';
import { VillageStorage } from '../Storage/VillageStorage';
import { calcGatheringTimings, GatheringTime } from '../Core/GatheringTimings';
import { OrderedProductionQueues, ProductionQueue } from '../Core/ProductionQueue';
import { Args } from '../Queue/Args';
import { timestamp } from '../Helpers/Time';
import { isInQueue, TaskCore } from '../Queue/Task';
import { TaskId } from '../Queue/TaskId';

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

export interface TaskState {
    id: TaskId;
    name: string;
    args: Args;
    isEnoughWarehouseCapacity: boolean;
    isEnoughGranaryCapacity: boolean;
    canBeBuilt: boolean;
}

interface TaskQueueState {
    queue: ProductionQueue;
    tasks: ReadonlyArray<TaskState>;
    finishTs: number;
}

interface ProductionQueueState {
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

interface WarehouseState {
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
    warehouse: WarehouseState;
    queues: Array<ProductionQueueState>;
    tasks: Array<TaskState>;
    firstReadyTask: TaskState | undefined;
    /**
     * Required resources for nearest task
     */
    required: ResourceLineState;
    incomingResources: Resources;
    settings: VillageSettings;
}

function makeResourceLineState(
    desired: Resources,
    current: Resources,
    performance: Resources
): ResourceLineState {
    return {
        resources: desired,
        balance: current.sub(desired),
        time: calcGatheringTimings(current, desired, performance).slowest,
        active: !desired.empty(),
    };
}

function makeWarehouseState(
    current: Resources,
    capacity: Resources,
    performance: Resources
): WarehouseState {
    // @fixme Если у героя большая добыча ресурсов, а склад маленький, то значения получаются тож маленькими
    // @fixme с одной деревней это не прокатывает, и даже не построить склад
    // const optimumFullness = capacity.sub(performance.scale(3));
    // const criticalFullness = capacity.sub(performance.scale(1));
    const optimumFullness = capacity.scale(0.9);
    const criticalFullness = capacity.scale(0.98);
    return {
        resources: current,
        capacity,
        performance,
        balance: capacity.sub(current),
        timeToZero: calcGatheringTimings(current, Resources.zero(), performance).fastest,
        timeToFull: calcGatheringTimings(current, capacity, performance).fastest,
        optimumFullness,
        criticalFullness,
        isOverflowing: criticalFullness.anyLower(current),
    };
}

function calcIncomingResources(storage: VillageStorage): Resources {
    return storage.getIncomingMerchants().reduce((m, i) => m.add(i.resources), Resources.zero());
}

function createProductionQueueState(
    taskQueueState: TaskQueueState,
    warehouseState: WarehouseState
): ProductionQueueState {
    const queue = taskQueueState.queue;
    const tasks = taskQueueState.tasks;
    const taskEndingTimestamp = taskQueueState.finishTs;
    const resources = warehouseState.resources;
    const performance = warehouseState.performance;
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
        firstTask: makeResourceLineState(firstTaskResources, resources, performance),
        allTasks: makeResourceLineState(allTaskResources, resources, performance),
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
    warehouse: WarehouseState,
    tasks: ReadonlyArray<TaskState>,
    storage: VillageStorage
) {
    let result: Array<ProductionQueueState> = [];
    const possibleTasks = tasks.filter((taskState) => taskState.canBeBuilt);
    for (let taskQueueInfo of getGroupedByQueueTasks(possibleTasks, storage)) {
        result.push(createProductionQueueState(taskQueueInfo, warehouse));
    }
    return result;
}

function getReadyForProductionTask(
    queues: ReadonlyArray<ProductionQueueState>
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

function getTotalTaskResources(task: TaskCore | undefined): Resources {
    if (task && task.args.resources) {
        const count = task.args.count || 1;
        return Resources.fromObject(task.args.resources).scale(count);
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
    const warehouse = makeWarehouseState(resources, capacity, performance);
    const tasks = storage.getTasks().map((t) => makeTaskState(t, warehouse.optimumFullness));
    const queues = createTaskQueueStates(warehouse, tasks, storage);
    const firstReadyTask = getReadyForProductionTask(queues);
    const firstTaskResources = getTotalTaskResources(firstReadyTask);
    return {
        id: village.id,
        village,
        resources,
        performance,
        warehouse,
        required: makeResourceLineState(firstTaskResources, resources, performance),
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
