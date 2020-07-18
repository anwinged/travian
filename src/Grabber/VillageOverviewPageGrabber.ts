import { Grabber } from './Grabber';
import { grabBuildingQueueInfo, grabResourcesPerformance } from '../Page/VillageBlock';
import { GrabError } from '../Errors';
import { ProductionQueue } from '../Core/ProductionQueue';
import { grabResourceSlots } from '../Page/SlotBlock';
import { BuildingQueueInfo } from '../Core/BuildingQueueInfo';
import { timestamp } from '../Helpers/Time';
import { parseLocation } from '../Helpers/Browser';

export class VillageOverviewPageGrabber extends Grabber {
    grab(): void {
        const p = parseLocation();
        if (p.pathname !== '/dorf1.php') {
            return;
        }

        this.storage.storeResourcesPerformance(grabResourcesPerformance());
        this.storage.storeResourceSlots(grabResourceSlots());

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
