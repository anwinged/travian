import { Grabber } from './Grabber';
import { grabVillageList } from '../Page/VillageBlock';
import { HeroStorage } from '../Storage/HeroStorage';
import { grabHeroAttributes, grabHeroVillage } from '../Page/HeroPage';
import { isHeroPage } from '../Page/PageDetector';

export class HeroPageGrabber extends Grabber {
    grab(): void {
        if (!isHeroPage()) {
            return;
        }

        const state = new HeroStorage();

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
