import { Village } from './Core/Village';
import { Scheduler } from './Scheduler';
import { Resources } from './Core/Resources';
import { VillageStorage } from './Storage/VillageStorage';
import { calcGatheringTimings } from './Core/GatheringTimings';

interface RequiredResources {
    resources: Resources;
    balance: Resources;
    time: number;
}

interface VillageOwnState {
    id: number;
    village: Village;
    resources: Resources;
    performance: Resources;
    required: RequiredResources;
    totalRequired: RequiredResources;
    incomingResources: Resources;
    storage: Resources;
    buildRemainingSeconds: number;
}

interface VillageOwnStateDictionary {
    [id: number]: VillageOwnState;
}

export interface VillageState extends VillageOwnState {
    commitments: Resources;
    shipment: Array<number>;
}

function calcResourceBalance(resources: Resources, current: Resources, performance: Resources): RequiredResources {
    return {
        resources: resources,
        balance: current.sub(resources),
        time: timeToResources(current, resources, performance),
    };
}

function timeToResources(current: Resources, desired: Resources, performance: Resources): number {
    const timings = calcGatheringTimings(current, desired, performance);
    if (timings.never) {
        return -1;
    }

    return timings.hours * 3600;
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
        required: calcResourceBalance(requiredResources, resources, performance),
        totalRequired: calcResourceBalance(totalRequiredResources, resources, performance),
        storage: Resources.fromStorage(resourceStorage),
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
    const commitments = villageIds.reduce((res, villageId) => {
        const villageRequired = ownStates[villageId].required;
        const missing = villageRequired.balance.min(Resources.zero());
        return res.add(missing);
    }, Resources.zero());
    return { ...state, commitments, shipment: villageIds };
}

export function createVillageStates(villages: Array<Village>, scheduler: Scheduler): Array<VillageState> {
    const ownStates = createVillageOwnStates(villages, scheduler);
    return villages.map(village => createVillageState(ownStates[village.id], ownStates, scheduler));
}
