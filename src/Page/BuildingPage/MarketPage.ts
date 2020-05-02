import { getNumber, uniqId } from '../../utils';
import { Resources } from '../../Core/Resources';
import { Coordinates } from '../../Core/Village';
import { IncomingMerchant } from '../../Core/Market';
import { grabResourcesFromList } from './BuildingPage';

interface SendResourcesClickHandler {
    (resources: Resources, crd: Coordinates, scale: number): void;
}

export function createSendResourcesButton(onClickHandler: SendResourcesClickHandler) {
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

    const createHandler = (handler: SendResourcesClickHandler, scale: number) => (evt: JQuery.Event) => {
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
