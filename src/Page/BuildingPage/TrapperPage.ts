import { Resources } from '../../Core/Resources';
import { GrabError } from '../../Errors';
import { grabResourcesFromList } from './BuildingPage';
import { elClassId, getNumber } from '../../Helpers/Convert';
import { uniqId } from '../../Helpers/Identity';
import { TrapStat } from '../../Core/Traps';

export function getTrapStats(): TrapStat {
    const $buildValue = jQuery('#build_value');
    const $trapsEl = jQuery('.traps');
    return {
        built: getNumber($trapsEl.find('b').get(0).innerText),
        canBuiltNow: 0,
        current: getNumber($buildValue.find('.currentLevel .number').text()),
        overall: getNumber($buildValue.find('.overall .number').text()),
        used: getNumber($trapsEl.find('b').get(1).innerText),
    };
}
