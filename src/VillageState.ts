import { Village, VillageSettings } from './Core/Village';
import { Resources } from './Core/Resources';
import { VillageStorage } from './Storage/VillageStorage';
import { calcGatheringTimings, GatheringTime } from './Core/GatheringTimings';
import { VillageRepositoryInterface } from './VillageRepository';
import { VillageNotFound } from './Errors';
import { ProductionQueue } from './Core/ProductionQueue';
import { Task } from './Queue/TaskProvider';
import { timestamp } from './utils';
import { QueueTasks, VillageTaskCollection } from './VillageTaskCollection';
import { TrainTroopTask } from './Task/TrainTroopTask';

interface VillageStorageState {
    resources: Resources;
    capacity: Resources;
    balance: Resources;
    performance: Resources;
    timeToZero: GatheringTime;
    timeToFull: GatheringTime;
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
    tasks: Array<Task>;
    isActive: boolean;
    currentTaskFinishTimestamp: number;
    currentTaskFinishSeconds: number;
    firstTask: ResourceLineState;
    allTasks: ResourceLineState;
    taskCount: number;
}

interface VillageProductionQueueStateDict {
    [queue: string]: VillageProductionQueueState;
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
    upperCriticalLevel: Resources;
    storageOptimumFullness: Resources;
    isOverflowing: boolean;
    queues: VillageProductionQueueStateDict;
    firstReadyTask: Task | undefined;
    /**
     * Required resources for nearest task
     */
    required: ResourceLineState;
    /**
     * Required resources for first tasks in production queues
     */
    frontierRequired: ResourceLineState;
    /**
     * Required resources for all tasks
     */
    totalRequired: ResourceLineState;
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

function makeResourceBalance(
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

function makeStorageBalance(
    resources: Resources,
    storage: Resources,
    performance: Resources
): VillageStorageState {
    return {
        resources,
        capacity: storage,
        performance,
        balance: storage.sub(resources),
        timeToZero: timeToFastestResource(resources, Resources.zero(), performance),
        timeToFull: timeToFastestResource(resources, storage, performance),
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
    storage: VillageStorage
): VillageProductionQueueState {
    const queue = taskQueueInfo.queue;
    const tasks = taskQueueInfo.tasks;
    const resources = storage.getResources();
    const performance = storage.getResourcesPerformance();

    const firstTaskResources = tasks.slice(0, 1).reduce(taskResourceReducer, Resources.zero());
    const allTaskResources = tasks.reduce(taskResourceReducer, Resources.zero());
    const taskEndingTimestamp = taskQueueInfo.finishTs;

    return {
        queue,
        tasks,
        isActive: tasks.length !== 0 || taskEndingTimestamp > timestamp(),
        currentTaskFinishTimestamp: taskEndingTimestamp,
        currentTaskFinishSeconds: Math.max(
            taskEndingTimestamp ? taskEndingTimestamp - timestamp() : 0,
            0
        ),
        firstTask: makeResourceBalance(firstTaskResources, resources, performance),
        allTasks: makeResourceBalance(allTaskResources, resources, performance),
        taskCount: tasks.length,
    };
}

function createAllProductionQueueStates(
    storage: VillageStorage,
    taskCollection: VillageTaskCollection
) {
    let result: VillageProductionQueueStateDict = {};
    for (let taskQueueInfo of taskCollection.getGroupedByQueueTasks()) {
        result[taskQueueInfo.queue] = createProductionQueueState(taskQueueInfo, storage);
    }
    return result;
}

function getReadyForProductionTask(
    queues: VillageProductionQueueStateDict,
    maxResourcesForTask: Resources
): Task | undefined {
    const nowTs = timestamp();
    const firstReadyGroup = Object.values(queues).find(
        group => group.currentTaskFinishTimestamp <= nowTs && group.tasks.length !== 0
    );
    if (!firstReadyGroup) {
        return undefined;
    }

    return firstReadyGroup.tasks.find(
        t =>
            t.name === TrainTroopTask.name ||
            !t.args.resources ||
            maxResourcesForTask.allGreaterOrEqual(Resources.fromObject(t.args.resources))
    );
}

function getReadyTaskRequiredResources(task: Task | undefined): Resources {
    if (task && task.args.resources) {
        return Resources.fromObject(task.args.resources);
    }
    return Resources.zero();
}

function createVillageOwnState(
    village: Village,
    storage: VillageStorage,
    taskCollection: VillageTaskCollection
): VillageOwnState {
    const resources = storage.getResources();
    const storageResources = Resources.fromStorage(storage.getResourceStorage());
    const performance = storage.getResourcesPerformance();
    const upperCriticalLevel = storageResources.sub(performance.scale(1));
    const storageOptimumFullness = storageResources.sub(performance.scale(3));
    const isOverflowing = upperCriticalLevel.anyLower(resources);
    const queues = createAllProductionQueueStates(storage, taskCollection);
    const firstReadyTask = getReadyForProductionTask(queues, storageOptimumFullness);
    const requiredResources = getReadyTaskRequiredResources(firstReadyTask);
    const frontierResources = taskCollection.getFrontierTaskResources();
    const totalRequiredResources = taskCollection.getAllTasksResources();

    return {
        id: village.id,
        village,
        resources,
        performance,
        storage: makeStorageBalance(resources, storageResources, performance),
        required: makeResourceBalance(requiredResources, resources, performance),
        upperCriticalLevel,
        storageOptimumFullness,
        isOverflowing,
        queues,
        firstReadyTask,
        frontierRequired: makeResourceBalance(frontierResources, resources, performance),
        totalRequired: makeResourceBalance(totalRequiredResources, resources, performance),
        incomingResources: calcIncomingResources(storage),
        settings: storage.getSettings(),
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
