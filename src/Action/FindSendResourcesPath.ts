import { ActionController, registerAction } from './ActionController';
import { FailTaskError, taskError, TryLaterError } from '../Errors';
import { Resources } from '../Core/Resources';
import { Coordinates } from '../Core/Village';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';
import { clickSendButton, fillSendResourcesForm } from '../Page/BuildingPage/MarketPage';
import { VillageState } from '../Village/VillageState';
import { MerchantsInfo } from '../Core/Market';
import { goToMarketSendResourcesPage, goToResourceViewPage } from '../Task/ActionBundles';
import {
    compareReports,
    ResourceTransferCalculator,
    ResourceTransferReport,
} from '../Village/ResourceTransfer';
import { ResourceTransferStorage } from '../Storage/ResourceTransferStorage';
import { path } from '../Helpers/Path';
import { MARKET_ID } from '../Core/Buildings';
import { aroundMinutes, timestamp } from '../Helpers/Time';

@registerAction
export class FindSendResourcesPath extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const reports: Array<ResourceTransferReport> = [];
        const calculator = new ResourceTransferCalculator(this.villageFactory);

        const villages = this.villageFactory.getAllVillages();
        for (let fromVillage of villages) {
            for (let toVillage of villages) {
                if (fromVillage.id !== toVillage.id) {
                    reports.push(calculator.calc(fromVillage.id, toVillage.id));
                }
            }
        }

        reports.sort(compareReports);

        const bestReport = reports.shift();

        if (!bestReport) {
            throw new FailTaskError('No best report for transfer resources');
        }

        console.log('Best report', bestReport);

        const storage = new ResourceTransferStorage();
        storage.storeReport(bestReport);

        const marketPath = path('/build.php', {
            newdid: bestReport.fromVillageId,
            gid: MARKET_ID,
            t: 5,
        });
        window.location.assign(marketPath);
    }
}
