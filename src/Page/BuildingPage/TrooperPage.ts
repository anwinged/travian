import { Resources } from '../../Core/Resources';
import { GrabError } from '../../Errors';
import { elClassId, getNumber, uniqId } from '../../utils';
import { grabResourcesFromList } from './BuildingPage';

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
