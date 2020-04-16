import { Coordinates, Village, VillageList } from '../Game';
import { GrabError } from '../Errors';
import * as URLParse from 'url-parse';
import { getNumber } from '../utils';

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

function grabVillageInfo($el): Village {
    const href = $el.attr('href');
    const parsedHref = new URLParse(href || '', true);
    const id = getNumber(parsedHref.query.newdid);
    const name = $el.find('.name').text();
    const active = $el.hasClass('active');
    const x = getNumber(
        $el
            .find('.coordinateX')
            .text()
            .replace('−‭', '-')
            .replace(/[^0-9-]/gi, '')
    );
    const y = getNumber(
        $el
            .find('.coordinateY')
            .text()
            .replace('−‭', '-')
            .replace(/[^0-9-]/gi, '')
    );
    return new Village(id, name, active, new Coordinates(x, y));
}
