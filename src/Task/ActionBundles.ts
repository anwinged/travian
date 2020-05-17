import { ActionDefinition } from './TaskController';
import { grabVillageList } from '../Page/VillageBlock';
import { GoToPageAction } from '../Action/GoToPageAction';
import { MARKET_ID } from '../Core/Buildings';
import { path } from '../Helpers/Path';

export function goToResourceViewPage(villageId: number): ActionDefinition {
    return [
        GoToPageAction.name,
        {
            path: path('/dorf1.php', { newdid: villageId }),
        },
    ];
}

export function goToMarketSendResourcesPage(villageId: number): ActionDefinition {
    return [
        GoToPageAction.name,
        {
            path: path('/build.php', { newdid: villageId, gid: MARKET_ID, t: 5 }),
        },
    ];
}

export function scanAllVillagesBundle(): Array<ActionDefinition> {
    const actions: Array<ActionDefinition> = [];
    const villages = grabVillageList();
    for (let village of villages) {
        actions.push(goToResourceViewPage(village.id));
        actions.push(goToMarketSendResourcesPage(village.id));
    }
    return actions;
}
