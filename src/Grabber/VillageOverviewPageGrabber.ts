import { Grabber } from './Grabber';
import { grabBuildingQueueInfo, grabResourcesPerformance } from '../Page/VillageBlock';
import { parseLocation, timestamp } from '../utils';
import { GrabError } from '../Errors';
import { BuildingQueueInfo } from '../Game';
import { ProductionQueue } from '../Core/ProductionQueue';

export class VillageOverviewPageGrabber extends Grabber {
    grab(): void {
        const p = parseLocation();
        if (p.pathname !== '/dorf1.php') {
            return;
        }

        this.storage.storeResourcesPerformance(grabResourcesPerformance());

        const buildingQueueInfo = this.grabBuildingQueueInfoOrDefault();
        const buildingEndTime = buildingQueueInfo.seconds
            ? buildingQueueInfo.seconds + timestamp()
            : 0;
        this.storage.storeQueueTaskEnding(ProductionQueue.Building, buildingEndTime);
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
