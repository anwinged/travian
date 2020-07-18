import { ActionDefinition } from './Task/BaseTask';
import { GoToPageAction } from './Action/GoToPageAction';
import { FORGE_ID, GUILD_HALL_ID, MARKET_ID } from '../Core/Buildings';
import { path } from '../Helpers/Path';
import { Village } from '../Core/Village';

export function goToResourceViewPage(villageId: number): ActionDefinition {
    return {
        name: GoToPageAction.name,
        args: {
            path: path('/dorf1.php', { newdid: villageId }),
        },
    };
}

export function goToBuildingsViewPage(villageId: number): ActionDefinition {
    return {
        name: GoToPageAction.name,
        args: {
            path: path('/dorf2.php', { newdid: villageId }),
        },
    };
}

export function goToMarketSendResourcesPage(villageId: number): ActionDefinition {
    return {
        name: GoToPageAction.name,
        args: {
            path: path('/build.php', { newdid: villageId, gid: MARKET_ID, t: 5 }),
        },
    };
}

export function goToForgePage(villageId: number): ActionDefinition {
    return {
        name: GoToPageAction.name,
        args: {
            path: path('/build.php', { newdid: villageId, gid: FORGE_ID }),
        },
    };
}

export function goToGuildHallPage(villageId: number): ActionDefinition {
    return {
        name: GoToPageAction.name,
        args: {
            path: path('/build.php', { newdid: villageId, gid: GUILD_HALL_ID }),
        },
    };
}

export function scanAllVillagesBundle(villages: Array<Village>): Array<ActionDefinition> {
    const actions: Array<ActionDefinition> = [];
    for (let village of villages) {
        actions.push(goToResourceViewPage(village.id));
        actions.push(goToBuildingsViewPage(village.id));
        actions.push(goToMarketSendResourcesPage(village.id));
        actions.push(goToForgePage(village.id));
        actions.push(goToGuildHallPage(village.id));
    }
    return actions;
}
