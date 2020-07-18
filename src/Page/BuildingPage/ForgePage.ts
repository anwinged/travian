import { Resources } from '../../Core/Resources';
import { grabResourcesFromList } from './BuildingPage';
import { GrabError } from '../../Errors';
import { elClassId, getNumber } from '../../Helpers/Convert';
import { uniqId } from '../../Helpers/Identity';

interface ResearchClickHandler {
    (resources: Resources, unitId: number): void;
}

export function createResearchButtons(onClickHandler: ResearchClickHandler) {
    const $els = jQuery('.research');
    $els.each((index, el) => createResearchButton(jQuery(el), onClickHandler));
}

function createResearchButton($researchBlockEl: JQuery, onClickHandler: ResearchClickHandler) {
    const unitId = grabUnitId($researchBlockEl);
    const resources = grabResources($researchBlockEl);

    const id = uniqId();
    $researchBlockEl.find('.cta').after(`<div style="padding: 8px">
        <a id="${id}" href="#">Исследовать</a>
    </div>`);

    jQuery(`#${id}`).on('click', evt => {
        evt.preventDefault();
        onClickHandler(resources, unitId);
    });
}

function grabUnitId($researchBlockEl: JQuery) {
    const unitImg = $researchBlockEl.find('img.unit');
    return getNumber(elClassId(unitImg.attr('class'), 'u'));
}

function grabResources($researchBlockEl: JQuery) {
    const $resEls = $researchBlockEl.find('.resourceWrapper .resource');
    return grabResourcesFromList($resEls);
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

interface ImprovementContract {
    unitId: number;
    resources: Resources;
}

export function grabImprovementContracts(): Array<ImprovementContract> {
    const result: Array<ImprovementContract> = [];
    const $els = jQuery('.research');
    $els.each((index, el) => {
        const $researchBlockEl = jQuery(el);
        const unitId = grabUnitId($researchBlockEl);
        const resources = grabResources($researchBlockEl);
        result.push({ unitId, resources });
    });
    return result;
}

export function grabRemainingSeconds(): number {
    const $el = jQuery('.under_progress .timer');
    return getNumber($el.attr('value'));
}
