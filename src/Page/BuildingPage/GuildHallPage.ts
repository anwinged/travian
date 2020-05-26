import { getNumber, uniqId } from '../../utils';
import { Resources } from '../../Core/Resources';
import { grabResourcesFromList } from './BuildingPage';
import { GrabError } from '../../Errors';

interface CelebrationClickHandler {
    (resources: Resources, id: number): void;
}

export function createCelebrationButtons(onClickHandler: CelebrationClickHandler) {
    const $els = jQuery('.build_details.researches .research');
    if ($els.length === 0) {
        throw new GrabError('No celebration research blocks');
    }
    $els.each((idx, el) => createCelebrationButton(jQuery(el), idx, onClickHandler));
}

export function clickCelebrationButton() {
    const $els = jQuery('.build_details.researches .research');
    if ($els.length === 0) {
        throw new GrabError('No celebration research blocks');
    }
    const $first = jQuery($els.get(0));
    const $btn = $first.find('.cta').find('button.green');
    if ($btn.length !== 1) {
        throw new GrabError('No celebration buttons');
    }
    $btn.trigger('click');
}

function createCelebrationButton(
    $blockEl: JQuery,
    idx: number,
    onClickHandler: CelebrationClickHandler
) {
    const resources = grabResources($blockEl);

    const id = uniqId();

    $blockEl.find('.information').append(`<div style="padding: 8px 0">
        <a id="${id}" href="#">Праздновать</a>
    </div>`);

    jQuery(`#${id}`).on('click', evt => {
        evt.preventDefault();
        onClickHandler(resources, idx);
    });
}

function grabResources($blockEl: JQuery) {
    const $resEls = $blockEl.find('.resourceWrapper .resource');
    return grabResourcesFromList($resEls);
}

export function grabRemainingSeconds(): number {
    const $el = jQuery('.under_progress .timer');
    return getNumber($el.attr('value'));
}
