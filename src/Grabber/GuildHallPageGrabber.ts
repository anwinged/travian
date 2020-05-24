import { Grabber } from './Grabber';
import { isGuildHallPage } from '../Page/PageDetectors';
import { grabRemainingSeconds } from '../Page/BuildingPage/GuildHallPage';
import { ProductionQueue } from '../Core/ProductionQueue';
import { timestamp } from '../utils';

export class GuildHallPageGrabber extends Grabber {
    grab(): void {
        if (!isGuildHallPage()) {
            return;
        }

        const seconds = grabRemainingSeconds();
        this.storage.storeQueueTaskEnding(ProductionQueue.Celebration, seconds ? seconds + timestamp() : 0);
    }
}
