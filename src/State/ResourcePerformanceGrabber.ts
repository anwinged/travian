import * as URLParse from 'url-parse';
import { StateGrabber } from './StateGrabber';
import { grabActiveVillageId, grabResourcesPerformance } from '../Page/VillageBlock';
import { VillageState } from './VillageState';

export class ResourcePerformanceGrabber extends StateGrabber {
    grab(): void {
        const p = new URLParse(window.location.href, true);
        if (p.pathname !== '/dorf1.php') {
            return;
        }

        const villageId = grabActiveVillageId();
        const state = new VillageState(villageId);
        state.storeResourcesPerformance(grabResourcesPerformance());
    }
}
