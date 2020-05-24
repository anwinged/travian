import { getNumber, uniqId } from '../../utils';
import { Resources, ResourcesInterface } from '../../Core/Resources';
import { Coordinates } from '../../Core/Village';
import { IncomingMerchant, MerchantsInfo } from '../../Core/Market';
import { grabResourcesFromList } from './BuildingPage';

interface SendResourcesClickHandler {
    (resources: Resources, crd: Coordinates): void;
}

export function createSendResourcesButton(onClickHandler: SendResourcesClickHandler) {
    const id = uniqId();

    jQuery('#button').before(`<div style="padding: 8px">
        <a id="${id}" href="#">Отправить</a> /  
    </div>`);

    const createHandler = () => (evt: JQuery.Event) => {
        evt.preventDefault();
        const sendSelect = jQuery('#send_select');
        const resources = new Resources(
            getNumber(sendSelect.find('#r1').val()),
            getNumber(sendSelect.find('#r2').val()),
            getNumber(sendSelect.find('#r3').val()),
            getNumber(sendSelect.find('#r4').val())
        );
        const crd = new Coordinates(getNumber(jQuery('#xCoordInput').val()), getNumber(jQuery('#yCoordInput').val()));
        onClickHandler(resources, crd);
    };

    jQuery(`#${id}`).on('click', createHandler());
}

export function grabMerchantsInfo(): MerchantsInfo {
    const available = getNumber(jQuery('.merchantsAvailable').text());
    const carry = getNumber(jQuery('.carry b').text());
    return { available, carry };
}

export function fillSendResourcesForm(resources: ResourcesInterface, crd: Coordinates) {
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
