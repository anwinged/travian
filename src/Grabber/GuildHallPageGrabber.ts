import { Grabber } from './Grabber';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { VillageStorage } from '../Storage/VillageStorage';
import { isGuildHallPage } from '../Page/PageDetectors';
import { grabRemainingSeconds } from '../Page/BuildingPage/GuildHallPage';
import { ProductionQueue } from '../Core/ProductionQueue';
import { timestamp } from '../utils';

export class GuildHallPageGrabber extends Grabber {
    grab(): void {
        if (!isGuildHallPage()) {
            return;
        }

        const villageId = grabActiveVillageId();
        const state = new VillageStorage(villageId);
        const seconds = grabRemainingSeconds();
        state.storeQueueTaskEnding(ProductionQueue.Celebration, seconds ? seconds + timestamp() : 0);
    }
}
