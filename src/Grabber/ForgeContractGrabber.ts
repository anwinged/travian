import { Grabber } from './Grabber';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { getBuildingPageAttributes, isForgePage } from '../Page/PageDetectors';
import { ContractType } from '../Scheduler';
import { grabImprovementContracts } from '../Page/BuildingPage/ForgePage';

export class ForgeContractGrabber extends Grabber {
    grab(): void {
        if (!isForgePage()) {
            return;
        }

        const villageId = grabActiveVillageId();
        const { buildId } = getBuildingPageAttributes();
        const contracts = grabImprovementContracts();

        for (let { resources, unitId } of contracts) {
            this.scheduler.updateResources(resources, {
                type: ContractType.ImproveTrooper,
                villageId,
                buildId,
                unitId,
            });
        }
    }
}
