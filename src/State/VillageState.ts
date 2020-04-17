import { DataStorage } from '../Storage/DataStorage';
import { Resources, ResourceStorage } from '../Game';

const RESOURCES_KEY = 'res';
const CAPACITY_KEY = 'cap';
const PERFORMANCE_KEY = 'perf';

export class VillageState {
    private storage: DataStorage;
    constructor(villageId: number) {
        this.storage = new DataStorage(`village.${villageId}`);
    }

    storeResources(resources: Resources) {
        this.storage.set(RESOURCES_KEY, resources);
    }

    getResources(): Resources {
        let plain = this.storage.get(RESOURCES_KEY);
        let res = new Resources(0, 0, 0, 0);
        return Object.assign(res, plain) as Resources;
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
        let plain = this.storage.get(PERFORMANCE_KEY);
        let res = new Resources(0, 0, 0, 0);
        return Object.assign(res, plain) as Resources;
    }
}
