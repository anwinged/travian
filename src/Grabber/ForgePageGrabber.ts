import { Grabber } from './Grabber';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { getBuildingPageAttributes, isForgePage } from '../Page/PageDetectors';
import { ContractType } from '../Scheduler';
import { grabImprovementContracts, grabRemainingSeconds } from '../Page/BuildingPage/ForgePage';
import { VillageStorage } from '../Storage/VillageStorage';
import { ProductionQueue } from '../Core/ProductionQueue';
import { timestamp } from '../utils';

export class ForgePageGrabber extends Grabber {
    grab(): void {
        if (!isForgePage()) {
            return;
        }

        const villageId = grabActiveVillageId();

        this.grabContracts(villageId);
        this.grabTimer(villageId);
    }

    private grabContracts(villageId: number): void {
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

    private grabTimer(villageId: number): void {
        const state = new VillageStorage(villageId);
        const seconds = grabRemainingSeconds();
        state.storeQueueTaskEnding(ProductionQueue.UpgradeUnit, seconds ? seconds + timestamp() : 0);
    }
}
