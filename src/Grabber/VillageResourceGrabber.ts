import { Grabber } from './Grabber';
import { grabVillageResources, grabVillageResourceStorage } from '../Page/ResourcesBlock';

export class VillageResourceGrabber extends Grabber {
    grab(): void {
        const storage = this.controller.getStorage();
        storage.storeResources(grabVillageResources());
        storage.storeResourceStorage(grabVillageResourceStorage());
    }
}
