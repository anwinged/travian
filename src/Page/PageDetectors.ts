import { elClassId, getNumber, parseLocation } from '../utils';
import { MARKET_ID } from '../Core/Buildings';

export interface BuildingPageAttributes {
    buildId: number;
    buildTypeId: number;
    categoryId: number;
    sheetId: number;
    tabId: number;
}

export function isBuildingPage() {
    const p = parseLocation();
    return p.pathname === '/build.php';
}

export function isHeroPage() {
    const p = parseLocation();
    return p.pathname === '/hero.php';
}

export function getBuildingPageAttributes(): BuildingPageAttributes {
    if (!isBuildingPage()) {
        throw Error('Not building page');
    }
    const p = parseLocation();
    return {
        buildId: getNumber(p.query.id),
        buildTypeId: getNumber(elClassId(jQuery('#build').attr('class'), 'gid')),
        categoryId: getNumber(p.query.category, 1),
        sheetId: getNumber(p.query.s, 0),
        tabId: getNumber(p.query.t, 0),
    };
}

export function isMarketSendResourcesPage(): boolean {
    if (!isBuildingPage()) {
        return false;
    }
    const { buildTypeId, tabId } = getBuildingPageAttributes();
    return buildTypeId === MARKET_ID && tabId === 5;
}
