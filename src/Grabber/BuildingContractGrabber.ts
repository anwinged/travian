import { Grabber } from './Grabber';
import { getBuildingPageAttributes, isBuildingPage } from '../Page/PageDetector';
import { grabContractResources, hasContractResources } from '../Page/BuildingPage/BuildingPage';
import { ContractType } from '../Core/Contract';

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

        const contract = grabContractResources();

        this.taskCollection.updateResourcesInTasks(contract, {
            type: ContractType.UpgradeBuilding,
            buildId: building.buildId,
        });
    }
}
