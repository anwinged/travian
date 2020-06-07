import { Grabber } from './Grabber';
import { getBuildingPageAttributes, isForgePage } from '../Page/PageDetectors';
import { ContractType } from '../Core/Contract';
import { grabImprovementContracts, grabRemainingSeconds } from '../Page/BuildingPage/ForgePage';
import { ProductionQueue } from '../Core/ProductionQueue';
import { timestamp } from '../utils';

export class ForgePageGrabber extends Grabber {
    grab(): void {
        if (!isForgePage()) {
            return;
        }

        this.grabContracts();
        this.grabTimer();
    }

    private grabContracts(): void {
        const { buildId } = getBuildingPageAttributes();
        const contracts = grabImprovementContracts();

        for (let { resources, unitId } of contracts) {
            this.taskCollection.updateResourcesInTasks(resources, {
                type: ContractType.ImproveTrooper,
                buildId,
                unitId,
            });
        }
    }

    private grabTimer(): void {
        const seconds = grabRemainingSeconds();
        this.storage.storeQueueTaskEnding(
            ProductionQueue.UpgradeUnit,
            seconds ? seconds + timestamp() : 0
        );
    }
}
