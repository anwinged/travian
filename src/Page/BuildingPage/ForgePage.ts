import { elClassId, getNumber, uniqId } from '../../utils';
import { Resources } from '../../Core/Resources';
import { grabResourcesFromList } from './BuildingPage';
import { GrabError } from '../../Errors';

interface ResearchClickHandler {
    (resources: Resources, unitId: number): void;
}

export function createResearchButtons(onClickHandler: ResearchClickHandler) {
    const $els = jQuery('.research');
    $els.each((index, $el) => createResearchButton(jQuery($el), onClickHandler));
}

function createResearchButton($el: JQuery, onClickHandler: ResearchClickHandler) {
    const unitId = grabUnitId($el);
    const resElement = $el.find('.resourceWrapper .resource');
    const resources = grabResourcesFromList(resElement);

    const id = uniqId();
    $el.find('.cta').after(`<div style="padding: 8px">
        <a id="${id}" href="#">Исследовать</a>
    </div>`);

    jQuery(`#${id}`).on('click', evt => {
        evt.preventDefault();
        onClickHandler(resources, unitId);
    });
}

function grabUnitId($el: JQuery) {
    const unitImg = $el.find('img.unit');
    return getNumber(elClassId(unitImg.attr('class'), 'u'));
}

export function clickResearchButton(unitId: number) {
    const $blockEl = findResearchBlockByUnitId(unitId);
    if ($blockEl === undefined) {
        throw new GrabError(`No research block for unit ${unitId}`);
    }
    const $btn = $blockEl.find('button.green.contracting');
    if ($btn.length !== 1) {
        throw new GrabError(`No research button for unit ${unitId}`);
    }
    $btn.trigger('click');
}

function findResearchBlockByUnitId(unitId: number): JQuery | undefined {
    const $els = jQuery('.research');
    let $blockEl: JQuery | undefined = undefined;
    $els.each((index, el) => {
        const $el = jQuery(el);
        const blockUnitId = grabUnitId($el);
        if (blockUnitId === unitId && $blockEl === undefined) {
            $blockEl = $el;
        }
    });
    return $blockEl;
}
