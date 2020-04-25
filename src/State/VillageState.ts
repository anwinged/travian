import { DataStorage } from '../DataStorage';
import { BuildingQueueInfo } from '../Game';
import { Resources, ResourcesInterface } from '../Core/Resources';
import { ResourceStorage } from '../Core/ResourceStorage';
import { IncomingMerchant } from '../Core/Market';

const RESOURCES_KEY = 'res';
const CAPACITY_KEY = 'cap';
const PERFORMANCE_KEY = 'perf';
const BUILDING_QUEUE_KEY = 'bq';
const INCOMING_MERCHANTS_KEY = 'im';

const ResourceOptions = {
    factory: () => new Resources(0, 0, 0, 0),
};

export class VillageState {
    private storage: DataStorage;
    constructor(villageId: number) {
        this.storage = new DataStorage(`village.${villageId}`);
    }

    storeResources(resources: Resources) {
        this.storage.set(RESOURCES_KEY, resources);
    }

    getResources(): Resources {
        return this.storage.getTyped(RESOURCES_KEY, ResourceOptions);
    }

    storeResourceStorage(storage: ResourceStorage) {
        this.storage.set(CAPACITY_KEY, storage);
    }

    getResourceStorage(): ResourceStorage {
        let plain = this.storage.get(CAPACITY_KEY);
        let res = new ResourceStorage(0, 0);
        return Object.assign(res, plain) as ResourceStorage;
    }

    storeResourcesPerformance(resources: Resources) {
        this.storage.set(PERFORMANCE_KEY, resources);
    }

    getResourcesPerformance(): Resources {
        return this.storage.getTyped(PERFORMANCE_KEY, ResourceOptions);
    }

    storeBuildingQueueInfo(info: BuildingQueueInfo): void {
        this.storage.set(BUILDING_QUEUE_KEY, info);
    }

    getBuildingQueueInfo(): BuildingQueueInfo {
        let plain = this.storage.get(BUILDING_QUEUE_KEY);
        let res = new BuildingQueueInfo(0);
        return Object.assign(res, plain) as BuildingQueueInfo;
    }

    storeIncomingMerchants(merchants: ReadonlyArray<IncomingMerchant>): void {
        this.storage.set(
            INCOMING_MERCHANTS_KEY,
            merchants.map(m => ({ ...m.resources, ts: m.ts }))
        );
    }

    getIncomingMerchants(): ReadonlyArray<IncomingMerchant> {
        const objects = this.storage.getTypedList<object>(INCOMING_MERCHANTS_KEY, { factory: () => ({}) });
        return objects.map((plain: object) => {
            const m = new IncomingMerchant(new Resources(0, 0, 0, 0), 0);
            if (typeof plain !== 'object') {
                return m;
            }
            const norm = plain as ResourcesInterface & { ts: number };
            return new IncomingMerchant(Resources.fromObject(norm), Number(norm.ts || 0));
        });
    }
}
