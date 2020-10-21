import { FORGE_ID, GUILD_HALL_ID, MARKET_ID, TRAPPER_ID } from '../Core/Buildings';
import { elClassId, getNumber } from '../Helpers/Convert';
import { parseLocation } from '../Helpers/Browser';

export interface BuildingPageAttributes {
    buildTypeId: number;
    level: number;
    buildId: number | undefined;
    categoryId: number | undefined;
    sheetId: number | undefined;
    tabId: number | undefined;
}

export function isBuildingPage() {
    const p = parseLocation();
    return p.pathname === '/build.php';
}

export function isHeroPage() {
    const p = parseLocation();
    return p.pathname === '/hero.php';
}

export function isAdventurePage() {
    const p = parseLocation();
    return p.pathname === '/hero.php' && p.query.t === '3';
}

export function getBuildingPageAttributes(): BuildingPageAttributes {
    if (!isBuildingPage()) {
        throw Error('Not building page');
    }
    const p = parseLocation();
    const $buildEl = jQuery('#build');
    return {
        buildTypeId: getNumber(elClassId($buildEl.attr('class'), 'gid')),
        level: getNumber(elClassId($buildEl.attr('class'), 'level')),
        buildId: getNumber(p.query.id) || undefined,
        categoryId: getNumber(p.query.category) || 1,
        sheetId: getNumber(p.query.s) || undefined,
        tabId: getNumber(p.query.t) || undefined,
    };
}

export function isMarketSendResourcesPage(): boolean {
    if (!isBuildingPage()) {
        return false;
    }
    const { buildTypeId, tabId } = getBuildingPageAttributes();
    return buildTypeId === MARKET_ID && tabId === 5;
}

export function isForgePage(): boolean {
    if (!isBuildingPage()) {
        return false;
    }
    const { buildTypeId } = getBuildingPageAttributes();
    return buildTypeId === FORGE_ID;
}

export function isGuildHallPage(): boolean {
    if (!isBuildingPage()) {
        return false;
    }
    const { buildTypeId } = getBuildingPageAttributes();
    return buildTypeId === GUILD_HALL_ID;
}

export function isTrapperPage(): boolean {
    if (!isBuildingPage()) {
        return false;
    }
    const { buildTypeId } = getBuildingPageAttributes();
    return buildTypeId === TRAPPER_ID;
}
