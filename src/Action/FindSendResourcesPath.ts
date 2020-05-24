import { ActionController, registerAction } from './ActionController';
import { FailTaskError, taskError, TryLaterError } from '../Errors';
import { Resources } from '../Core/Resources';
import { Coordinates } from '../Core/Village';
import { aroundMinutes, timestamp } from '../utils';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';
import { clickSendButton, fillSendResourcesForm } from '../Page/BuildingPage/MarketPage';
import { VillageState } from '../VillageState';
import { MerchantsInfo } from '../Core/Market';
import { goToMarketSendResourcesPage, goToResourceViewPage } from '../Task/ActionBundles';
import { ResourceTransferCalculator, ResourceTransferReport } from '../ResourceTransfer';
import { ResourceTransferStorage } from '../Storage/ResourceTransferStorage';
import { path } from '../Helpers/Path';
import { MARKET_ID } from '../Core/Buildings';

@registerAction
export class FindSendResourcesPath extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const reports: Array<ResourceTransferReport> = [];
        const calculator = new ResourceTransferCalculator(this.villageFactory);

        const villages = this.villageFactory.getAllVillages();
        for (let fromVillage of villages) {
            for (let toVillage of villages) {
                reports.push(calculator.calc(fromVillage.id, toVillage.id));
            }
        }

        reports.sort((r1, r2) => r2.score - r1.score);

        const bestReport = reports.shift();

        if (!bestReport) {
            throw new FailTaskError('No best report for transfer resources');
        }

        console.log('Best report', bestReport);

        const storage = new ResourceTransferStorage();
        storage.storeReport(bestReport);

        const marketPath = path('/build.php', { newdid: bestReport.fromVillageId, gid: MARKET_ID, t: 5 });
        window.location.assign(marketPath);
    }
}
