import { GrabError } from '../Errors';
import { elClassId, getNumber, trimPrefix, uniqId } from '../utils';
import { Resources } from '../Core/Resources';
import { Coordinates } from '../Core/Village';
import { IncomingMerchant } from '../Core/Market';

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

export function createSendResourcesButton(
    onClickHandler: (resources: Resources, crd: Coordinates, scale: number) => void
) {
    const id1 = uniqId();
    const id10 = uniqId();
    const id100 = uniqId();
    const id1000 = uniqId();

    jQuery('#button').before(`<div style="padding: 8px">
        <a id="${id1}" href="#">Отправить</a> / 
        <a id="${id10}" href="#">x10</a> / 
        <a id="${id100}" href="#">x100</a> /
        <a id="${id1000}" href="#">x1000</a>
    </div>`);

    const createHandler = (handler, scale) => evt => {
        evt.preventDefault();
        const sendSelect = jQuery('#send_select');
        const resources = new Resources(
            getNumber(sendSelect.find('#r1').val()),
            getNumber(sendSelect.find('#r2').val()),
            getNumber(sendSelect.find('#r3').val()),
            getNumber(sendSelect.find('#r4').val())
        );
        const crd = new Coordinates(getNumber(jQuery('#xCoordInput').val()), getNumber(jQuery('#yCoordInput').val()));
        onClickHandler(resources, crd, scale);
    };

    jQuery(`#${id1}`).on('click', createHandler(onClickHandler, 1));
    jQuery(`#${id10}`).on('click', createHandler(onClickHandler, 10));
    jQuery(`#${id100}`).on('click', createHandler(onClickHandler, 100));
    jQuery(`#${id1000}`).on('click', createHandler(onClickHandler, 1000));
}

export function grabMerchantsInfo() {
    const available = getNumber(jQuery('.merchantsAvailable').text());
    const carry = getNumber(jQuery('.carry b').text());
    return { available, carry };
}

export function fillSendResourcesForm(resources: Resources, crd: Coordinates) {
    const sendSelect = jQuery('#send_select');
    sendSelect.find('#r1').val(resources.lumber);
    sendSelect.find('#r2').val(resources.clay);
    sendSelect.find('#r3').val(resources.iron);
    sendSelect.find('#r4').val(resources.crop);
    jQuery('#xCoordInput').val(crd.x);
    jQuery('#yCoordInput').val(crd.y);
}

export function clickSendButton() {
    jQuery('#enabledButton').trigger('click');
}

export function grabIncomingMerchants(): ReadonlyArray<IncomingMerchant> {
    const result: Array<IncomingMerchant> = [];
    const root = jQuery('#merchantsOnTheWay .ownMerchants');
    root.find('.traders').each((idx, el) => {
        const $el = jQuery(el);
        result.push(
            new IncomingMerchant(
                grabResourcesFromList($el.find('.resourceWrapper .resources')),
                getNumber($el.find('.timer').attr('value'))
            )
        );
    });
    return result;
}
