import { BaseAction } from './BaseAction';
import { FailTaskError } from '../../Errors';
import { Args } from '../../Queue/Args';
import {
    compareReports,
    ResourceTransferCalculator,
    ResourceTransferReport,
} from '../../Village/ResourceTransfer';
import { ResourceTransferStorage } from '../../Storage/ResourceTransferStorage';
import { path } from '../../Helpers/Path';
import { MARKET_ID } from '../../Core/Buildings';
import { registerAction } from '../ActionMap';
import { Task } from '../../Queue/Task';

const MAX_VILLAGE_DISTANCE = 25;

@registerAction
export class FindSendResourcesPathAction extends BaseAction {
    async run(args: Args, task: Task): Promise<any> {
        const reports: Array<ResourceTransferReport> = [];
        const calculator = new ResourceTransferCalculator(this.villageFactory);

        const villages = this.villageFactory.getAllVillages();
        for (let fromVillage of villages) {
            for (let toVillage of villages) {
                const dist = fromVillage.crd.dist(toVillage.crd);
                if (fromVillage.id !== toVillage.id && dist < MAX_VILLAGE_DISTANCE) {
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
