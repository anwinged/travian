import { Village, VillageSettings } from './Core/Village';
import { Resources } from './Core/Resources';
import { VillageStorage } from './Storage/VillageStorage';
import { calcGatheringTimings, GatheringTime } from './Core/GatheringTimings';
import { VillageRepositoryInterface } from './VillageRepository';
import { VillageNotFound } from './Errors';
import { ProductionQueue, ProductionQueueTypes } from './Core/ProductionQueue';
import { Task } from './Queue/TaskProvider';
import { timestamp } from './utils';
import { VillageControllerFactory } from './VillageControllerFactory';
import { VillageController } from './VillageController';

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
}

interface VillageProductionQueueState {
    queue: ProductionQueue;
    isActive: boolean;
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
    buildRemainingSeconds: number;
    settings: VillageSettings;
    queues: { [queue: string]: VillageProductionQueueState | undefined };
}

interface VillageOwnStateDictionary {
    [id: number]: VillageOwnState;
}

export interface VillageState extends VillageOwnState {
    /**
     * Resource commitments of this village to other (may be negative)
     */
    commitments: Resources;
    /**
     * List of village id, from which resources ship to this village
     */
    shipment: Array<number>;
}

function calcResourceBalance(resources: Resources, current: Resources, performance: Resources): ResourceLineState {
    return {
        resources,
        balance: current.sub(resources),
        time: timeToAllResources(current, resources, performance),
    };
}

function calcStorageBalance(resources: Resources, storage: Resources, performance: Resources): VillageStorageState {
    return {
        resources,
        capacity: storage,
        performance,
        balance: storage.sub(resources),
        timeToZero: timeToFastestResource(resources, Resources.zero(), performance),
        timeToFull: timeToFastestResource(resources, storage, performance),
    };
}

function timeToAllResources(current: Resources, desired: Resources, performance: Resources): GatheringTime {
    const timings = calcGatheringTimings(current, desired, performance);
    return timings.slowest;
}

function timeToFastestResource(current: Resources, desired: Resources, performance: Resources): GatheringTime {
    const timings = calcGatheringTimings(current, desired, performance);
    return timings.fastest;
}

function calcIncomingResources(storage: VillageStorage): Resources {
    return storage.getIncomingMerchants().reduce((m, i) => m.add(i.resources), Resources.zero());
}

function taskResourceReducer(resources: Resources, task: Task) {
    return task.args.resources ? resources.add(Resources.fromObject(task.args.resources)) : resources;
}

function createProductionQueueState(
    queue: ProductionQueue,
    controller: VillageController
): VillageProductionQueueState {
    const storage = controller.getStorage();
    const resources = storage.getResources();
    const performance = storage.getResourcesPerformance();
    const tasks = controller.getTasksInProductionQueue(queue);

    const firstTaskResources = tasks.slice(0, 1).reduce(taskResourceReducer, Resources.zero());
    const allTaskResources = tasks.reduce(taskResourceReducer, Resources.zero());
    const taskEndingTimestamp = storage.getQueueTaskEnding(queue);

    return {
        queue,
        isActive: tasks.length !== 0 || taskEndingTimestamp > timestamp(),
        currentTaskFinishTimestamp: taskEndingTimestamp,
        currentTaskFinishSeconds: Math.max(taskEndingTimestamp ? taskEndingTimestamp - timestamp() : 0, 0),
        firstTask: calcResourceBalance(firstTaskResources, resources, performance),
        allTasks: calcResourceBalance(allTaskResources, resources, performance),
        taskCount: tasks.length,
    };
}

function createAllProductionQueueStates(controller: VillageController) {
    let result: { [queue: string]: VillageProductionQueueState } = {};
    for (let queue of ProductionQueueTypes) {
        result[queue] = createProductionQueueState(queue, controller);
    }
    return result;
}

function calcFrontierResources(controller: VillageController): Resources {
    let result = Resources.zero();
    for (let queue of ProductionQueueTypes) {
        const tasks = controller.getTasksInProductionQueue(queue);
        const firstTaskResources = tasks.slice(0, 1).reduce(taskResourceReducer, Resources.zero());
        result = result.add(firstTaskResources);
    }
    return result;
}

function createVillageOwnState(village: Village, controller: VillageController): VillageOwnState {
    const storage = controller.getStorage();
    const resources = storage.getResources();
    const resourceStorage = storage.getResourceStorage();
    const performance = storage.getResourcesPerformance();
    const buildQueueInfo = storage.getBuildingQueueInfo();
    const requiredResources = controller.getVillageRequiredResources();
    const frontierResources = calcFrontierResources(controller);
    const totalRequiredResources = controller.getTotalVillageRequiredResources();

    return {
        id: village.id,
        village,
        resources,
        performance,
        storage: calcStorageBalance(resources, Resources.fromStorage(resourceStorage), performance),
        required: calcResourceBalance(requiredResources, resources, performance),
        frontierRequired: calcResourceBalance(frontierResources, resources, performance),
        totalRequired: calcResourceBalance(totalRequiredResources, resources, performance),
        buildRemainingSeconds: buildQueueInfo.seconds,
        incomingResources: calcIncomingResources(storage),
        settings: storage.getSettings(),
        queues: createAllProductionQueueStates(controller),
    };
}

function createVillageOwnStates(
    villages: Array<Village>,
    villageControllerFactory: VillageControllerFactory
): VillageOwnStateDictionary {
    const result: VillageOwnStateDictionary = {};
    for (let village of villages) {
        const villageController = villageControllerFactory.create(village.id);
        result[village.id] = createVillageOwnState(village, villageController);
    }
    return result;
}

function createVillageState(state: VillageOwnState, ownStates: VillageOwnStateDictionary): VillageState {
    const villageIds = Object.keys(ownStates).map(k => +k);
    const commitments = villageIds.reduce((memo, shipmentVillageId) => {
        const shipmentVillageState = ownStates[shipmentVillageId];
        const shipmentVillageRequired = shipmentVillageState.required;
        const shipmentVillageIncoming = shipmentVillageState.incomingResources;
        const targetVillageMissing = shipmentVillageRequired.balance.add(shipmentVillageIncoming).min(Resources.zero());
        return memo.add(targetVillageMissing);
    }, Resources.zero());
    return { ...state, commitments, shipment: villageIds };
}

function getVillageStates(
    villages: Array<Village>,
    villageControllerFactory: VillageControllerFactory
): Array<VillageState> {
    const ownStates = createVillageOwnStates(villages, villageControllerFactory);
    return villages.map(village => createVillageState(ownStates[village.id], ownStates));
}

export class VillageStateRepository {
    private villageRepository: VillageRepositoryInterface;
    private villageControllerFactory: VillageControllerFactory;

    constructor(villageRepository: VillageRepositoryInterface, villageControllerFactory: VillageControllerFactory) {
        this.villageRepository = villageRepository;
        this.villageControllerFactory = villageControllerFactory;
    }

    getAllVillageStates(): Array<VillageState> {
        return getVillageStates(this.villageRepository.all(), this.villageControllerFactory);
    }

    getVillageState(villageId: number): VillageState {
        const states = getVillageStates(this.villageRepository.all(), this.villageControllerFactory);
        const needle = states.find(s => s.id === villageId);
        if (!needle) {
            throw new VillageNotFound(`Village ${villageId} not found`);
        }
        return needle;
    }
}
