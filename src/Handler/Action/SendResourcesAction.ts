import { BaseAction } from './BaseAction';
import { Args } from '../../Queue/Args';
import { clickSendButton, fillSendResourcesForm } from '../../Page/BuildingPage/MarketPage';
import { ResourceTransferCalculator } from '../../Village/ResourceTransfer';
import { ResourceTransferStorage } from '../../Storage/ResourceTransferStorage';
import { Resources } from '../../Core/Resources';
import { AbortTaskError } from '../../Errors';
import { registerAction } from '../ActionMap';
import { Task } from '../../Queue/Task';

@registerAction
export class SendResourcesAction extends BaseAction {
    async run(args: Args, task: Task): Promise<any> {
        const storage = new ResourceTransferStorage();
        const savedReport = storage.getReport();

        const fromVillage = this.villageFactory.getById(savedReport.fromVillageId).short();
        const toVillage = this.villageFactory.getById(savedReport.toVillageId).short();

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
