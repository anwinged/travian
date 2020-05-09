import { Village } from './Core/Village';
import { grabVillageList } from './Page/VillageBlock';

export interface VillageRepositoryInterface {
    all(): Array<Village>;
}

export class VillageRepository implements VillageRepositoryInterface {
    all(): Array<Village> {
        return grabVillageList();
    }
}
