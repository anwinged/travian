import { BuildingQueueInfo } from '../Game';
import { GrabError } from '../Errors';
import { getNumber, parseLocation } from '../utils';
import { Resources } from '../Core/Resources';
import { Coordinates, Village, VillageList } from '../Core/Village';

function getVillageListItems() {
    const $elements = jQuery('#sidebarBoxVillagelist ul li a');
    if ($elements.length === 0) {
        throw new GrabError('Village list items not found');
    }
    return $elements;
}

export function grabVillageList(): VillageList {
    const villageList: VillageList = [];
    const $elements = getVillageListItems();
    $elements.each((idx, el) => {
        villageList.push(grabVillageInfo(jQuery(el)));
    });
    return villageList;
}

export function grabActiveVillage(): Village | undefined {
    const villageList = grabVillageList();
    for (let village of villageList) {
        if (village.active) {
            return village;
        }
    }
    return undefined;
}

export function grabActiveVillageId(): number {
    return grabActiveVillage()?.id || 0;
}

function grabVillageInfo($el: JQuery): Village {
    const href = $el.attr('href');
    const parsedHref = parseLocation(href || '');
    const id = getNumber(parsedHref.query.newdid);
    const name = $el.find('.name').text();
    const active = $el.hasClass('active');
    const x = getNumber($el.find('.coordinateX').text());
    const y = getNumber($el.find('.coordinateY').text());
    return new Village(id, name, active, new Coordinates(x, y));
}

export function grabResourcesPerformance(): Resources {
    const $el = jQuery('#production');
    if ($el.length !== 1) {
        throw new GrabError('No production element');
    }

    const $nums = $el.find('td.num');

    return new Resources(
        getNumber($nums.get(0).innerText),
        getNumber($nums.get(1).innerText),
        getNumber($nums.get(2).innerText),
        getNumber($nums.get(3).innerText)
    );
}

export function grabBuildingQueueInfo(): BuildingQueueInfo {
    const timer = jQuery('.buildDuration .timer');
    if (timer.length !== 1) {
        throw new GrabError('No building queue timer element');
    }

    const remainingSeconds = getNumber(timer.attr('value'));

    return new BuildingQueueInfo(remainingSeconds);
}
