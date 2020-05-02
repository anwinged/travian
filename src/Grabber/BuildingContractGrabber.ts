import { Grabber } from './Grabber';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { getBuildingPageAttributes, isBuildingPage } from '../Page/PageDetectors';
import { grabContractResources, hasContractResources } from '../Page/BuildingPage/BuildingPage';
import { ContractType } from '../Scheduler';

export class BuildingContractGrabber extends Grabber {
    grab(): void {
        if (!isBuildingPage()) {
            return;
        }

        const building = getBuildingPageAttributes();
        if (!building.buildTypeId) {
            return;
        }

        if (!hasContractResources()) {
            return;
        }

        const villageId = grabActiveVillageId();
        const contract = grabContractResources();

        this.scheduler.updateResources(contract, {
            type: ContractType.UpgradeBuilding,
            villageId,
            buildId: building.buildId,
        });
    }
}
