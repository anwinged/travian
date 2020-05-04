import { ActionDefinition } from './TaskController';
import { grabVillageList } from '../Page/VillageBlock';
import { GoToPageAction } from '../Action/GoToPageAction';
import { MARKET_ID } from '../Core/Buildings';
import { path } from '../Helpers/Path';

export function scanAllVillagesBundle(): Array<ActionDefinition> {
    const actions: Array<ActionDefinition> = [];
    const villages = grabVillageList();
    for (let village of villages) {
        actions.push([
            GoToPageAction.name,
            {
                path: path('/dorf1.php', { newdid: village.id }),
            },
        ]);
        actions.push([
            GoToPageAction.name,
            {
                path: path('/build.php', { newdid: village.id, gid: MARKET_ID, t: 5 }),
            },
        ]);
    }
    return actions;
}
