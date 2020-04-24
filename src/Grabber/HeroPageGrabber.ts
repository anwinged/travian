import { Grabber } from './Grabber';
import {
    grabActiveVillageId,
    grabBuildingQueueInfo,
    grabResourcesPerformance,
    grabVillageList,
} from '../Page/VillageBlock';
import { VillageState } from '../State/VillageState';
import { parseLocation } from '../utils';
import { GrabError } from '../Errors';
import { BuildingQueueInfo } from '../Game';
import { HeroState } from '../State/HeroState';
import { grabHeroAttributes, grabHeroVillage } from '../Page/HeroPage';

export class HeroPageGrabber extends Grabber {
    grab(): void {
        const p = parseLocation();
        if (p.pathname !== '/hero.php') {
            return;
        }

        const state = new HeroState();

        state.storeAttributes(grabHeroAttributes());

        const villageId = this.getHeroVillageId();
        if (villageId) {
            state.storeVillageId(villageId);
        }
    }

    private getHeroVillageId(): number | undefined {
        const villages = grabVillageList();
        const heroVillage = grabHeroVillage();

        for (let village of villages) {
            if (village.name === heroVillage) {
                return village.id;
            }
        }

        return undefined;
    }
}
