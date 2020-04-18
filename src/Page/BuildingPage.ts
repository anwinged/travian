import { GrabError } from '../Errors';
import { getNumber, trimPrefix, uniqId } from '../utils';
import { Resources } from '../Game';

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

export function createBuildButton(onClickHandler: (buildTypeId: number) => void) {
    const $els = jQuery('[id^=contract_building]');
    $els.each((idx, el) => {
        const $el = jQuery(el);
        const id = getNumber(trimPrefix($el.attr('id') || '', 'contract_building'));
        const btnId = uniqId();
        $el.append(`<div style="padding: 8px"><a id="${btnId}" href="#">Построить</a></div>`);
        jQuery(`#${btnId}`).on('click', evt => {
            evt.preventDefault();
            onClickHandler(id);
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

export function createUpgradeButton(onClickHandler: () => void) {
    const id = uniqId();
    jQuery('.upgradeButtonsContainer .section1').append(
        `<div style="padding: 8px"><a id="${id}" href="#">В очередь</a></div>`
    );
    jQuery(`#${id}`).on('click', evt => {
        evt.preventDefault();
        onClickHandler();
    });
}

export function grabContractResources(): Resources {
    const $els = jQuery('#contract .resource');
    if ($els.length === 0) {
        throw new GrabError('No resource contract element');
    }
    const grab = n =>
        getNumber(
            jQuery($els.get(n))
                .find('.value')
                .text()
        );
    return new Resources(grab(0), grab(1), grab(2), grab(3));
}
