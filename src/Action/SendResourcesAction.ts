import { ActionController, registerAction } from './ActionController';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';
import { clickSendButton, fillSendResourcesForm } from '../Page/BuildingPage/MarketPage';
import { ResourceTransferCalculator } from '../ResourceTransfer';
import { ResourceTransferStorage } from '../Storage/ResourceTransferStorage';
import { Resources } from '../Core/Resources';
import { AbortTaskError } from '../Errors';

@registerAction
export class SendResourcesAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const storage = new ResourceTransferStorage();
        const savedReport = storage.getReport();

        const fromVillage = this.villageFactory.getVillage(savedReport.fromVillageId);
        const toVillage = this.villageFactory.getVillage(savedReport.toVillageId);

        const coordinates = toVillage.crd;

        const calculator = new ResourceTransferCalculator(this.villageFactory);
        const report = calculator.calc(fromVillage.id, toVillage.id);

        console.log('To transfer report', report);

        if (Resources.fromObject(report.resources).empty()) {
            throw new AbortTaskError('No resources to transfer');
        }

        fillSendResourcesForm(report.resources, coordinates);
        clickSendButton();
    }
}
