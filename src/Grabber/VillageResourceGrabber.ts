import { Grabber } from './Grabber';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { grabVillageResources, grabVillageResourceStorage } from '../Page/ResourcesBlock';
import { VillageState } from '../State/VillageState';

export class VillageResourceGrabber extends Grabber {
    grab(): void {
        const villageId = grabActiveVillageId();
        const state = new VillageState(villageId);
        state.storeResources(grabVillageResources());
        state.storeResourceStorage(grabVillageResourceStorage());
    }
}
