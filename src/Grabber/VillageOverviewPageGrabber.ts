import { Grabber } from './Grabber';
import { grabActiveVillageId, grabBuildingQueueInfo, grabResourcesPerformance } from '../Page/VillageBlock';
import { VillageState } from '../State/VillageState';
import { parseLocation } from '../utils';
import { GrabError } from '../Errors';
import { BuildingQueueInfo } from '../Game';

export class VillageOverviewPageGrabber extends Grabber {
    grab(): void {
        const p = parseLocation();
        if (p.pathname !== '/dorf1.php') {
            return;
        }

        const villageId = grabActiveVillageId();
        const state = new VillageState(villageId);
        state.storeResourcesPerformance(grabResourcesPerformance());
        state.storeBuildingQueueInfo(this.grabBuildingQueueInfoOrDefault());
    }

    private grabBuildingQueueInfoOrDefault() {
        try {
            return grabBuildingQueueInfo();
        } catch (e) {
            if (e instanceof GrabError) {
                return new BuildingQueueInfo(0);
            }
            throw e;
        }
    }
}
