import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { BuildingQueueFullError } from '../Errors';

@registerAction
export class CheckBuildingRemainingTimeAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const timer = jQuery('.buildDuration .timer');
        if (timer.length === 1) {
            const remainingSeconds = Number(timer.attr('value'));
            if (remainingSeconds > 0) {
                throw new BuildingQueueFullError(task.id, remainingSeconds + 1, 'Building queue is full');
            }
        }
    }
}
