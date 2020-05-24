import { Grabber } from './Grabber';
import { grabVillageResources, grabVillageResourceStorage } from '../Page/ResourcesBlock';

export class VillageResourceGrabber extends Grabber {
    grab(): void {
        this.storage.storeResources(grabVillageResources());
        this.storage.storeResourceStorage(grabVillageResourceStorage());
    }
}
