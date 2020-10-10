import { Coordinates, Village } from '../Core/Village';
import { grabVillageList } from '../Page/VillageBlock';
import { VillageNotFound } from '../Errors';

export interface VillageRepositoryInterface {
    all(): Array<Village>;
    getById(villageId: number): Village;
    getByCrd(crd: Coordinates): Village;
    getActive(): Village;
}

export class VillageRepository implements VillageRepositoryInterface {
    all(): Array<Village> {
        return grabVillageList();
    }

    getById(villageId: number): Village {
        const village = this.all().find((vlg) => vlg.id === villageId);
        if (!village) {
            throw new VillageNotFound('Active village not found');
        }
        return village;
    }

    getByCrd(crd: Coordinates): Village {
        const village = this.all().find((vlg) => vlg.crd.eq(crd));
        if (!village) {
            throw new VillageNotFound('Village not found');
        }
        return village;
    }

    getActive(): Village {
        const village = this.all().find((vlg) => vlg.active);
        if (!village) {
            throw new VillageNotFound('Active village not found');
        }
        return village;
    }
}
