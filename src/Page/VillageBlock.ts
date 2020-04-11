import { Coordinates, Village, VillageList } from '../Game';
import { GrabError } from '../Errors';
import * as URLParse from 'url-parse';
import { getNumber } from '../utils';

export function grabVillageList(): VillageList {
    const villageList: VillageList = [];
    const $elements = getVillageListItems();
    $elements.each((idx, el) => {
        villageList.push(grabVillageInfo(jQuery(el)));
    });
    return villageList;
}

export function grabActiveVillageId(): number {
    const villageList = grabVillageList();
    for (let village of villageList) {
        if (village.active) {
            return village.id;
        }
    }
    return 0;
}

function getVillageListItems() {
    const $elements = jQuery('#sidebarBoxVillagelist ul li a');
    if ($elements.length === 0) {
        throw new GrabError('Village list items not found');
    }
    return $elements;
}

function grabVillageInfo($el): Village {
    const href = $el.attr('href');
    const parsedHref = new URLParse(href || '', true);
    const id = getNumber(parsedHref.query.newdid);
    const name = $el.find('.name').text();
    const active = $el.hasClass('active');
    return new Village(id, name, active, new Coordinates(0, 0));
}
