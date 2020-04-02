import ActionController from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { TryLaterError } from '../Errors';

export default class CheckBuildingRemainingTimeAction extends ActionController {
    static NAME = 'check_building_remaining_time';

    async run(args: Args, task: Task): Promise<any> {
        const timer = jQuery('.buildDuration .timer');
        if (timer.length === 1) {
            const remainingSeconds = Number(timer.attr('value'));
            if (remainingSeconds > 0) {
                throw new TryLaterError(
                    remainingSeconds + 1,
                    'Building queue is full'
                );
            }
        }
    }
}
