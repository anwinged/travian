import { Village } from './Core/Village';
import { Scheduler } from './Scheduler';
import { Resources } from './Core/Resources';
import { VillageStorage } from './Storage/VillageStorage';
import { calcGatheringTimings, GatheringTime } from './Core/GatheringTimings';
import { VillageRepositoryInterface } from './VillageRepository';
import { VillageNotFound } from './Errors';

interface StorageBalance {
    resources: Resources;
    storage: Resources;
    balance: Resources;
    performance: Resources;
    timeToZero: GatheringTime;
    timeToFull: GatheringTime;
}

interface RequiredResources {
    resources: Resources;
    balance: Resources;
    time: GatheringTime;
}

interface VillageOwnState {
    id: number;
    village: Village;
    resources: Resources;
    performance: Resources;
    storage: Resources;
    storageBalance: StorageBalance;
    required: RequiredResources;
    totalRequired: RequiredResources;
    incomingResources: Resources;
    buildRemainingSeconds: number;
}

interface VillageOwnStateDictionary {
    [id: number]: VillageOwnState;
}

export interface VillageState extends VillageOwnState {
    /**
     * Resource commitments of this village to other
     */
    commitments: Resources;
    /**
     * List of village id, from which resources ship to this village
     */
    shipment: Array<number>;
}

function calcResourceBalance(resources: Resources, current: Resources, performance: Resources): RequiredResources {
    return {
        resources,
        balance: current.sub(resources),
        time: timeToAllResources(current, resources, performance),
    };
}

function calcStorageBalance(resources: Resources, storage: Resources, performance: Resources): StorageBalance {
    return {
        resources,
        storage,
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

function createVillageOwnState(village: Village, scheduler: Scheduler): VillageOwnState {
    const storage = new VillageStorage(village.id);
    const resources = storage.getResources();
    const resourceStorage = storage.getResourceStorage();
    const performance = storage.getResourcesPerformance();
    const buildQueueInfo = storage.getBuildingQueueInfo();
    const requiredResources = scheduler.getVillageRequiredResources(village.id);
    const totalRequiredResources = scheduler.getTotalVillageRequiredResources(village.id);

    return {
        id: village.id,
        village,
        resources,
        performance,
        storage: Resources.fromStorage(resourceStorage),
        storageBalance: calcStorageBalance(resources, Resources.fromStorage(resourceStorage), performance),
        required: calcResourceBalance(requiredResources, resources, performance),
        totalRequired: calcResourceBalance(totalRequiredResources, resources, performance),
        buildRemainingSeconds: buildQueueInfo.seconds,
        incomingResources: calcIncomingResources(storage),
    };
}

function createVillageOwnStates(villages: Array<Village>, scheduler: Scheduler): VillageOwnStateDictionary {
    const result: VillageOwnStateDictionary = {};
    for (let village of villages) {
        result[village.id] = createVillageOwnState(village, scheduler);
    }
    return result;
}

function createVillageState(
    state: VillageOwnState,
    ownStates: VillageOwnStateDictionary,
    scheduler: Scheduler
): VillageState {
    const villageIds = scheduler.getResourceShipmentVillageIds(state.id);
    const commitments = villageIds.reduce((memo, shipmentVillageId) => {
        const shipmentVillageState = ownStates[shipmentVillageId];
        const shipmentVillageRequired = shipmentVillageState.required;
        const shipmentVillageIncoming = shipmentVillageState.incomingResources;
        const targetVillageMissing = shipmentVillageRequired.balance.add(shipmentVillageIncoming).min(Resources.zero());
        return memo.add(targetVillageMissing);
    }, Resources.zero());
    return { ...state, commitments, shipment: villageIds };
}

function getVillageStates(villages: Array<Village>, scheduler: Scheduler): Array<VillageState> {
    const ownStates = createVillageOwnStates(villages, scheduler);
    return villages.map(village => createVillageState(ownStates[village.id], ownStates, scheduler));
}

export class VillageStateRepository {
    private villageRepository: VillageRepositoryInterface;
    private scheduler: Scheduler;

    constructor(villageRepository: VillageRepositoryInterface, scheduler: Scheduler) {
        this.villageRepository = villageRepository;
        this.scheduler = scheduler;
    }

    getAllVillageStates(): Array<VillageState> {
        return getVillageStates(this.villageRepository.all(), this.scheduler);
    }

    getVillageState(villageId: number): VillageState {
        const states = getVillageStates(this.villageRepository.all(), this.scheduler);
        const needle = states.find(s => s.id === villageId);
        if (!needle) {
            throw new VillageNotFound(`Village ${villageId} not found`);
        }
        return needle;
    }
}
