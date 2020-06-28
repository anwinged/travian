import { Village, VillageSettings } from './Core/Village';
import { Resources } from './Core/Resources';
import { VillageStorage } from './Storage/VillageStorage';
import { calcGatheringTimings, GatheringTime } from './Core/GatheringTimings';
import { VillageRepositoryInterface } from './VillageRepository';
import { VillageNotFound } from './Errors';
import { ProductionQueue } from './Core/ProductionQueue';
import { Task, TaskId } from './Queue/TaskProvider';
import { timestamp } from './utils';
import { QueueTasks, VillageTaskCollection } from './VillageTaskCollection';
import { TrainTroopTask } from './Task/TrainTroopTask';
import { Args } from './Queue/Args';

export interface TaskState {
    id: TaskId;
    name: string;
    args: Args;
    canBeBuilt: boolean;
}

interface VillageStorageState {
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

interface VillageProductionQueueState {
    queue: ProductionQueue;
    tasks: Array<TaskState>;
    isActive: boolean;
    isWaiting: boolean;
    currentTaskFinishTimestamp: number;
    currentTaskFinishSeconds: number;
    firstTask: ResourceLineState;
    allTasks: ResourceLineState;
    taskCount: number;
}

interface VillageOwnState {
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
    storage: VillageStorageState;
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

interface VillageOwnStateDictionary {
    [id: number]: VillageOwnState;
}

export interface VillageState extends VillageOwnState {
    /**
     * Resource commitments of this village to other (may be negative)
     */
    commitments: Resources;
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

function makeStorageState(
    resources: Resources,
    storage: Resources,
    performance: Resources
): VillageStorageState {
    const optimumFullness = storage.sub(performance.scale(3));
    const criticalFullness = storage.sub(performance.scale(1));
    return {
        resources,
        capacity: storage,
        performance,
        balance: storage.sub(resources),
        timeToZero: timeToFastestResource(resources, Resources.zero(), performance),
        timeToFull: timeToFastestResource(resources, storage, performance),
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

function taskResourceReducer(resources: Resources, task: Task) {
    return task.args.resources
        ? resources.add(Resources.fromObject(task.args.resources))
        : resources;
}

function createProductionQueueState(
    taskQueueInfo: QueueTasks,
    storage: VillageStorageState
): VillageProductionQueueState {
    const queue = taskQueueInfo.queue;
    const tasks = taskQueueInfo.tasks;
    const taskEndingTimestamp = taskQueueInfo.finishTs;
    const resources = storage.resources;
    const performance = storage.performance;
    const firstTaskResources = tasks.slice(0, 1).reduce(taskResourceReducer, Resources.zero());
    const allTaskResources = tasks.reduce(taskResourceReducer, Resources.zero());

    const currentTimestamp = timestamp();

    return {
        queue,
        tasks: tasks.map(t => makeTaskState(t, storage.optimumFullness)),
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

function createAllProductionQueueStates(
    storage: VillageStorageState,
    taskCollection: VillageTaskCollection
) {
    let result: Array<VillageProductionQueueState> = [];
    for (let taskQueueInfo of taskCollection.getGroupedByQueueTasks()) {
        result.push(createProductionQueueState(taskQueueInfo, storage));
    }
    return result;
}

function getReadyForProductionTask(
    queues: ReadonlyArray<VillageProductionQueueState>
): TaskState | undefined {
    const firstReadyQueue = queues.find(queue => queue.isWaiting);
    if (!firstReadyQueue) {
        return undefined;
    }

    return firstReadyQueue.tasks.find(task => task.name === TrainTroopTask.name || task.canBeBuilt);
}

function getTaskResources(task: Task | TaskState | undefined): Resources {
    if (task && task.args.resources) {
        return Resources.fromObject(task.args.resources);
    }
    return Resources.zero();
}

function makeTaskState(task: Task, maxResourcesForTask: Resources): TaskState {
    return {
        id: task.id,
        args: task.args,
        name: task.name,
        canBeBuilt: maxResourcesForTask.allGreaterOrEqual(getTaskResources(task)),
    };
}

function createVillageOwnState(
    village: Village,
    storage: VillageStorage,
    taskCollection: VillageTaskCollection
): VillageOwnState {
    const settings = storage.getSettings();
    const resources = storage.getResources();
    const storageResources = Resources.fromStorage(storage.getResourceStorage());
    const performance = storage.getResourcesPerformance();
    const storageState = makeStorageState(resources, storageResources, performance);
    const queues = createAllProductionQueueStates(storageState, taskCollection);
    const firstReadyTask = getReadyForProductionTask(queues);

    const requiredResources = getTaskResources(firstReadyTask);
    return {
        id: village.id,
        village,
        resources,
        performance,
        storage: storageState,
        required: makeResourceState(requiredResources, resources, performance),
        queues,
        tasks: taskCollection.getTasks().map(t => makeTaskState(t, storageState.optimumFullness)),
        firstReadyTask,
        incomingResources: calcIncomingResources(storage),
        settings,
    };
}

function createVillageOwnStates(
    villages: Array<Village>,
    storageFactory: VillageStorageFactory,
    taskCollectionFactory: VillageTaskCollectionFactory
): VillageOwnStateDictionary {
    const result: VillageOwnStateDictionary = {};
    for (let village of villages) {
        result[village.id] = createVillageOwnState(
            village,
            storageFactory(village.id),
            taskCollectionFactory(village.id)
        );
    }
    return result;
}

function createVillageState(
    state: VillageOwnState,
    ownStates: VillageOwnStateDictionary
): VillageState {
    const villageIds = Object.keys(ownStates).map(k => +k);
    const commitments = villageIds.reduce((memo, shipmentVillageId) => {
        const shipmentVillageState = ownStates[shipmentVillageId];
        const shipmentVillageRequired = shipmentVillageState.required;
        const shipmentVillageIncoming = shipmentVillageState.incomingResources;
        const targetVillageMissing = shipmentVillageRequired.balance
            .add(shipmentVillageIncoming)
            .min(Resources.zero());
        return memo.add(targetVillageMissing);
    }, Resources.zero());
    return { ...state, commitments };
}

function getVillageStates(
    villages: Array<Village>,
    storageFactory: VillageStorageFactory,
    taskCollectionFactory: VillageTaskCollectionFactory
): Array<VillageState> {
    const ownStates = createVillageOwnStates(villages, storageFactory, taskCollectionFactory);
    return villages.map(village => createVillageState(ownStates[village.id], ownStates));
}

interface VillageStorageFactory {
    (villageId: number): VillageStorage;
}

interface VillageTaskCollectionFactory {
    (villageId: number): VillageTaskCollection;
}

export class VillageStateFactory {
    private readonly villageRepository: VillageRepositoryInterface;
    private readonly storageFactory: VillageStorageFactory;
    private readonly taskCollectionFactory: VillageTaskCollectionFactory;

    constructor(
        villageRepository: VillageRepositoryInterface,
        storageFactory: VillageStorageFactory,
        taskCollectionFactory: VillageTaskCollectionFactory
    ) {
        this.villageRepository = villageRepository;
        this.storageFactory = storageFactory;
        this.taskCollectionFactory = taskCollectionFactory;
    }

    getAllVillageStates(): Array<VillageState> {
        return getVillageStates(
            this.villageRepository.all(),
            this.storageFactory,
            this.taskCollectionFactory
        );
    }

    getVillageState(villageId: number): VillageState {
        const states = getVillageStates(
            this.villageRepository.all(),
            this.storageFactory,
            this.taskCollectionFactory
        );
        const needle = states.find(s => s.id === villageId);
        if (!needle) {
            throw new VillageNotFound(`Village ${villageId} not found`);
        }
        return needle;
    }
}
