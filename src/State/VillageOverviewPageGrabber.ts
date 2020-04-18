import { StateGrabber } from './StateGrabber';
import { grabActiveVillageId, grabBuildingQueueInfo, grabResourcesPerformance } from '../Page/VillageBlock';
import { VillageState } from './VillageState';
import { parseLocation } from '../utils';

export class VillageOverviewPageGrabber extends StateGrabber {
    grab(): void {
        const p = parseLocation();
        if (p.pathname !== '/dorf1.php') {
            return;
        }

        const villageId = grabActiveVillageId();
        const state = new VillageState(villageId);
        state.storeResourcesPerformance(grabResourcesPerformance());
        state.storeBuildingQueueInfo(grabBuildingQueueInfo());
    }
}
