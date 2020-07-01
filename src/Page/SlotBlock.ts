import { elClassId, getNumber } from '../utils';
import { BuildingSlot, ResourceSlot } from '../Game';
import { numberToResourceType } from '../Core/ResourceType';

interface SlotElement {
    el: HTMLElement;
    buildId: number;
}

function slotElements(prefix: string): Array<SlotElement> {
    const result: Array<SlotElement> = [];
    jQuery('.level.colorLayer').each((idx, el) => {
        const buildId = getNumber(elClassId(jQuery(el).attr('class'), prefix));
        result.push({ el, buildId });
    });
    return result;
}

function showSlotIds(prefix: string, buildingIds: Array<number>): void {
    const slots = slotElements(prefix);
    slots.forEach(slot => {
        const upCount = buildingIds.filter(id => id === slot.buildId).length;
        const $slotEl = jQuery(slot.el);
        const $labelEl = $slotEl.find('.labelLayer');
        const oldLabel = $labelEl.data('oldLabel') || $labelEl.text();
        $labelEl.data('oldLabel', oldLabel);
        $labelEl.text(slot.buildId + ':' + oldLabel + (upCount > 0 ? '+' + upCount : ''));
        $slotEl.css({ 'border-radius': '20%', 'width': upCount > 0 ? '56px' : '42px' });
        $labelEl.css({
            'border-radius': '10%',
            'top': '3px',
            'left': '3px',
            'height': '19px',
            'line-height': '19px',
            'width': upCount > 0 ? '50px' : '36px',
        });

        if (upCount) {
            $slotEl.css({
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

function onSlotCtrlClick(prefix: string, onClickHandler: (buildId: number) => void): void {
    const slots = slotElements(prefix);
    slots.forEach(slot => {
        jQuery(slot.el)
            .find('.labelLayer')
            .on('click', evt => {
                if (evt.ctrlKey) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    onClickHandler(slot.buildId);
                }
            });
    });
}

export function onResourceSlotCtrlClick(onClickHandler: (buildId: number) => void): void {
    onSlotCtrlClick('buildingSlot', onClickHandler);
}

export function onBuildingSlotCtrlClick(onClickHandler: (buildId: number) => void): void {
    onSlotCtrlClick('aid', onClickHandler);
}

function makeResourceSlot(slot: SlotElement): ResourceSlot {
    const $el = jQuery(slot.el);
    const classes = $el.attr('class');
    return {
        buildId: getNumber(elClassId(classes, 'buildingSlot')),
        type: numberToResourceType(getNumber(elClassId(classes, 'gid'))),
        level: getNumber(elClassId(classes, 'level')),
        isReady: !$el.hasClass('notNow'),
        isUnderConstruction: $el.hasClass('underConstruction'),
        isMaxLevel: $el.hasClass('maxLevel'),
    };
}

export function grabResourceSlots(): Array<ResourceSlot> {
    return slotElements('buildingSlot').map(makeResourceSlot);
}

function makeBuildingSlot(slot: SlotElement): BuildingSlot {
    const $el = jQuery(slot.el);
    const classes = $el.attr('class');
    const $parent = $el.closest('.buildingSlot');
    const parentClasses = $parent.attr('class');
    return {
        buildId: getNumber(elClassId(classes, 'aid')),
        buildTypeId: getNumber(elClassId(parentClasses, 'g')),
        level: getNumber(elClassId(classes, 'level')),
        isReady: !$el.hasClass('notNow'),
        isUnderConstruction: $el.hasClass('underConstruction'),
        isMaxLevel: $el.hasClass('maxLevel'),
    };
}

export function grabBuildingSlots(): Array<BuildingSlot> {
    return slotElements('aid').map(makeBuildingSlot);
}
