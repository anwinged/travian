import { GrabError } from '../../Errors';
import { getNumber, trimPrefix, uniqId } from '../../utils';
import { Resources } from '../../Core/Resources';

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

export function grabResourcesFromList($els: JQuery) {
    const getText = (n: number) =>
        jQuery($els.get(n))
            .find('.value')
            .text();
    const grab = (n: number) => getNumber(getText(n));
    return new Resources(grab(0), grab(1), grab(2), grab(3));
}

function findContractResourceElements() {
    return jQuery('#contract .resource');
}

export function hasContractResources(): boolean {
    return findContractResourceElements().length !== 0;
}

export function grabContractResources(): Resources {
    const $els = findContractResourceElements();
    if ($els.length === 0) {
        throw new GrabError('No resource contract element');
    }
    return grabResourcesFromList($els);
}
