import { Grabber } from './Grabber';
import { grabVillageList } from '../Page/VillageBlock';
import { HeroState } from '../State/HeroState';
import { grabHeroAttributes, grabHeroVillage } from '../Page/HeroPage';
import { isHeroPage } from '../Page/PageDetectors';

export class HeroPageGrabber extends Grabber {
    grab(): void {
        if (!isHeroPage()) {
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
