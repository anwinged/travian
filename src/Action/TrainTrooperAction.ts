import { ActionController, registerAction } from './ActionController';
import { Args } from '../Command';
import { ActionError, TryLaterError } from '../Errors';
import { Task } from '../Queue/TaskQueue';
import { getNumber, toNumber } from '../utils';

@registerAction
export class TrainTrooperAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const troopId = this.getTroopId(args);
        const trainCount = this.getTrainCount(args);

        const block = jQuery(`.innerTroopWrapper[data-troopid="${troopId}"]`);
        if (block.length !== 1) {
            throw new ActionError(`Troop block not found`);
        }

        const countLink = block.find('.cta a');
        if (countLink.length !== 1) {
            throw new ActionError(`Link with max count not found`);
        }

        const maxCount = getNumber(countLink.text());
        if (maxCount < trainCount) {
            throw new TryLaterError(20 * 60, `Max count ${maxCount} less then need ${trainCount}`);
        }

        const input = block.find(`input[name="t${troopId}"]`);
        if (input.length !== 1) {
            throw new ActionError(`Input element not found`);
        }

        const trainButton = jQuery('.startTraining.green').first();
        if (trainButton.length !== 1) {
            throw new ActionError('Train button not found');
        }

        input.val(trainCount);
        trainButton.trigger('click');
    }

    private getTroopId(args: Args): number {
        const troopId = toNumber(args.troopId);
        if (troopId === undefined) {
            throw new ActionError(`Troop id must be a number, given "${args.troopId}"`);
        }
        return troopId;
    }

    private getTrainCount(args: Args): number {
        const trainCount = toNumber(args.trainCount);
        if (trainCount === undefined) {
            throw new ActionError(`Train count must be a number, given "${args.trainCount}"`);
        }
        return trainCount;
    }
}
