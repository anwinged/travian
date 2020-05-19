import { Grabber } from './Grabber';
import { grabActiveVillageId, grabBuildingQueueInfo, grabResourcesPerformance } from '../Page/VillageBlock';
import { VillageStorage } from '../Storage/VillageStorage';
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

        const villageId = grabActiveVillageId();
        const storage = new VillageStorage(villageId);
        storage.storeResourcesPerformance(grabResourcesPerformance());
        storage.storeBuildingQueueInfo(this.grabBuildingQueueInfoOrDefault());

        const buildingQueueInfo = this.grabBuildingQueueInfoOrDefault();
        const buildingEndTime = buildingQueueInfo.seconds ? buildingQueueInfo.seconds + timestamp() : 0;
        storage.storeQueueTaskEnding(ProductionQueue.Building, buildingEndTime);
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
