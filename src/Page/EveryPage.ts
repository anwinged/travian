import * as URLParse from 'url-parse';
import { elClassId, getNumber } from '../utils';

export function grabActiveVillageId(): number {
    const href = jQuery('#sidebarBoxVillagelist a.active').attr('href');
    const p = new URLParse(href || '', true);
    console.log('VILLAGE REF', href, p);
    return getNumber(p.query.newdid);
}

function showSlotIds(prefix: string, buildingIds: number[]): void {
    jQuery('.level.colorLayer').each((idx, el) => {
        const buildId = getNumber(elClassId(jQuery(el).attr('class') || '', prefix));
        const oldLabel = jQuery(el)
            .find('.labelLayer')
            .text();
        jQuery(el)
            .find('.labelLayer')
            .text(buildId + ':' + oldLabel);
        const inQueue = buildingIds.includes(buildId);
        if (inQueue) {
            jQuery(el).css({
                'background-image': 'linear-gradient(to top, #f00, #f00 100%)',
            });
        }
    });
}

export function showFieldsSlotIds(buildingIds: number[]) {
    showSlotIds('buildingSlot', buildingIds);
}

export function showBuildingSlotIds(buildingIds: number[]) {
    showSlotIds('aid', buildingIds);
}
