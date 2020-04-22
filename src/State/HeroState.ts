import { DataStorage } from '../DataStorage';
import { HeroAttributes } from '../Core/Hero';

const VILLAGE_ID_KEY = 'village_id';
const ATTRIBUTES_KEY = 'attr';

export class HeroState {
    private storage: DataStorage;
    constructor() {
        this.storage = new DataStorage('hero.v1');
    }

    storeVillageId(villageId: number) {
        this.storage.set(VILLAGE_ID_KEY, villageId);
    }

    getVillageId(): number | undefined {
        return (this.storage.get(VILLAGE_ID_KEY) as number) || undefined;
    }

    storeAttributes(attributes: HeroAttributes) {
        this.storage.set(ATTRIBUTES_KEY, attributes);
    }

    getAttributes(): HeroAttributes {
        let plain = this.storage.get(ATTRIBUTES_KEY);
        let res = new HeroAttributes(0);
        return Object.assign(res, plain) as HeroAttributes;
    }
}
