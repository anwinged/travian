import { DataStorage } from '../Storage/DataStorage';
import { Resources, ResourceStorage } from '../Game';

export class VillageState {
    private storage: DataStorage;
    constructor(villageId: number) {
        this.storage = new DataStorage(`village.${villageId}`);
    }

    storeResources(resources: Resources) {
        this.storage.set('res', resources);
    }

    getResources(): Resources {
        let plain = this.storage.get('res');
        let res = new Resources(0, 0, 0, 0);
        return Object.assign(res, plain) as Resources;
    }

    storeResourceStorage(storage: ResourceStorage) {
        this.storage.set('cap', storage);
    }

    getResourceStorage(): ResourceStorage {
        let plain = this.storage.get('res');
        let res = new ResourceStorage(0, 0);
        return Object.assign(res, plain) as ResourceStorage;
    }
}
