import { Grabber } from './Grabber';
import { grabVillageResources, grabVillageWarehouseCapacity } from '../Page/ResourcesBlock';

export class VillageResourceGrabber extends Grabber {
    grab(): void {
        this.storage.storeResources(grabVillageResources());
        this.storage.storeWarehouseCapacity(grabVillageWarehouseCapacity());
    }
}
