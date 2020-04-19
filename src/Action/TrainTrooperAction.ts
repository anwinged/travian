import { ActionController, registerAction } from './ActionController';
import { Args } from '../Command';
import { ActionError, TryLaterError } from '../Errors';
import { Task } from '../Queue/TaskQueue';
import { getNumber, toNumber } from '../utils';

@registerAction
export class TrainTrooperAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const troopId = this.getTroopId(args, task);
        const trainCount = this.getTrainCount(args, task);

        const block = jQuery(`#nonFavouriteTroops .innerTroopWrapper.troop${troopId}`);
        if (block.length !== 1) {
            throw new ActionError(task.id, `Troop block not found`);
        }

        const countLink = block.find('.cta a');
        if (countLink.length !== 1) {
            throw new ActionError(task.id, `Link with max count not found`);
        }

        const maxCount = getNumber(countLink.text());
        if (maxCount < trainCount) {
            throw new TryLaterError(task.id, 20 * 60, `Max count ${maxCount} less then need ${trainCount}`);
        }

        const input = block.find(`input[name="t${troopId}"]`);
        if (input.length !== 1) {
            throw new ActionError(task.id, `Input element not found`);
        }

        const trainButton = jQuery('.startTraining.green').first();
        if (trainButton.length !== 1) {
            throw new ActionError(task.id, 'Train button not found');
        }

        input.val(trainCount);
        trainButton.trigger('click');
    }

    private getTroopId(args: Args, task: Task): number {
        const troopId = toNumber(args.troopId);
        if (troopId === undefined) {
            throw new ActionError(task.id, `Troop id must be a number, given "${args.troopId}"`);
        }
        return troopId;
    }

    private getTrainCount(args: Args, task: Task): number {
        const trainCount = toNumber(args.trainCount);
        if (trainCount === undefined) {
            throw new ActionError(task.id, `Train count must be a number, given "${args.trainCount}"`);
        }
        return trainCount;
    }
}
