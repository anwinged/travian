import { elClassId, getNumber } from '../utils';

interface Slot {
    el: HTMLElement;
    buildId: number;
}

function slotElements(prefix: string): Array<Slot> {
    const result: Array<Slot> = [];
    jQuery('.level.colorLayer').each((idx, el) => {
        const buildId = getNumber(elClassId(jQuery(el).attr('class') || '', prefix));
        result.push({ el, buildId });
    });
    return result;
}

function showSlotIds(prefix: string, buildingIds: number[]): void {
    const slots = slotElements(prefix);
    slots.forEach(slot => {
        const oldLabel = jQuery(slot.el)
            .find('.labelLayer')
            .text();
        jQuery(slot.el)
            .find('.labelLayer')
            .text(slot.buildId + ':' + oldLabel);
        const inQueue = buildingIds.includes(slot.buildId);
        if (inQueue) {
            jQuery(slot.el).css({
                'background-image': 'linear-gradient(to top, #f00, #f00 100%)',
            });
        }
    });
}

export function showResourceSlotIds(buildingIds: number[]): void {
    showSlotIds('buildingSlot', buildingIds);
}

export function showBuildingSlotIds(buildingIds: number[]): void {
    showSlotIds('aid', buildingIds);
}

export function onResourceSlotCtrlClick(cb: (buildId: number) => void): void {
    const slots = slotElements('buildingSlot');
    slots.forEach(slot => {
        jQuery(slot.el)
            .find('.labelLayer')
            .on('click', evt => {
                if (evt.ctrlKey) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    cb(slot.buildId);
                }
            });
    });
}
