import { Grabber } from './Grabber';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { grabVillageResources, grabVillageResourceStorage } from '../Page/ResourcesBlock';
import { VillageStorage } from '../Storage/VillageStorage';

export class VillageResourceGrabber extends Grabber {
    grab(): void {
        const villageId = grabActiveVillageId();
        const state = new VillageStorage(villageId);
        state.storeResources(grabVillageResources());
        state.storeResourceStorage(grabVillageResourceStorage());
    }
}
