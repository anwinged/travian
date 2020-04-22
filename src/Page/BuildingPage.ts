import { GrabError } from '../Errors';
import { elClassId, getNumber, trimPrefix, uniqId } from '../utils';
import { Resources } from '../Core/Resources';

export function clickBuildButton(typeId: number) {
    const section = jQuery(`#contract_building${typeId}`);
    if (section.length !== 1) {
        throw new GrabError('No build section');
    }
    const btn = section.find('.contractLink button.green.new');
    if (btn.length !== 1) {
        throw new GrabError('No build button, try later');
    }
    btn.trigger('click');
}

export function createBuildButton(onClickHandler: (buildTypeId: number, resources: Resources) => void) {
    const $els = jQuery('[id^=contract_building]');
    $els.each((idx, el) => {
        const $el = jQuery(el);
        const buildTypeId = getNumber(trimPrefix($el.attr('id') || '', 'contract_building'));
        const btnId = uniqId();
        const resElement = $el.find('.resourceWrapper .resource');
        const resources = grabResourcesFromList(resElement);
        $el.append(`<div style="padding: 8px"><a id="${btnId}" href="#">Построить</a></div>`);
        jQuery(`#${btnId}`).on('click', evt => {
            evt.preventDefault();
            onClickHandler(buildTypeId, resources);
        });
    });
}

export function hasUpgradeButton(): boolean {
    const btn = jQuery('.upgradeButtonsContainer .section1 button.green.build');
    return btn.length === 1;
}

export function clickUpgradeButton() {
    const btn = jQuery('.upgradeButtonsContainer .section1 button.green.build');
    if (btn.length !== 1) {
        throw new GrabError('No upgrade button, try later');
    }
    btn.trigger('click');
}

export function createUpgradeButton(onClickHandler: (resources: Resources) => void) {
    const upgradeContainer = jQuery('.upgradeButtonsContainer .section1');
    if (upgradeContainer.length !== 1) {
        return;
    }
    const id = uniqId();
    const btn = `<div style="padding: 8px"><a id="${id}" href="#">В очередь</a></div>`;
    upgradeContainer.append(btn);
    const resources = grabContractResources();
    jQuery(`#${id}`).on('click', evt => {
        evt.preventDefault();
        onClickHandler(resources);
    });
}

function grabResourcesFromList($els) {
    const getText = n =>
        jQuery($els.get(n))
            .find('.value')
            .text();
    const grab = n => getNumber(getText(n));
    return new Resources(grab(0), grab(1), grab(2), grab(3));
}

export function grabContractResources(): Resources {
    const $els = jQuery('#contract .resource');
    if ($els.length === 0) {
        throw new GrabError('No resource contract element');
    }
    return grabResourcesFromList($els);
}

export function createTrainTroopButtons(
    onClickHandler: (troopId: number, resources: Resources, count: number) => void
) {
    const troopBlocks = jQuery('.action.troop:not(.empty) .innerTroopWrapper');
    if (troopBlocks.length === 0) {
        throw new GrabError('No troop blocks');
    }
    troopBlocks.each((idx, el) => {
        const $el = jQuery(el);
        const troopId = elClassId($el.attr('class'), 'troop');
        if (troopId === undefined) {
            return;
        }
        const id = uniqId();
        $el.find('.details').append(`<div style="padding: 8px 0"><a id="${id}" href="#">Обучить</a></div>`);
        const resElement = $el.find('.resourceWrapper .resource');
        const resources = grabResourcesFromList(resElement);
        jQuery(`#${id}`).on('click', evt => {
            evt.preventDefault();
            const input = $el.find(`input[name="t${troopId}"]`);
            const count = getNumber(input.val());
            if (count > 0) {
                onClickHandler(troopId, resources, count);
            }
        });
    });
}
