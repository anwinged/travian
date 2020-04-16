import { StateGrabber } from './StateGrabber';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { grabResources } from '../Page/ResourcesBlock';
import { VillageState } from './VillageState';

export class ResourceGrabber extends StateGrabber {
    grab(): void {
        const villageId = grabActiveVillageId();
        const resources = grabResources();
        const state = new VillageState(villageId);
        state.storeResources(resources);
    }
}
