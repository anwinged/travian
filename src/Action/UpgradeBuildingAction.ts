import ActionController from './ActionController';
import { Args } from '../Common';
import { TryLaterError } from '../Errors';
import Scheduler from '../Scheduler';
import { Task } from '../Storage/TaskQueue';

export default class UpgradeBuildingAction extends ActionController {
    static NAME = 'upgrade_building';
    private scheduler: Scheduler;

    constructor(scheduler: Scheduler) {
        super();
        this.scheduler = scheduler;
    }

    async run(args: Args, task: Task): Promise<any> {
        const btn = jQuery(
            '.upgradeButtonsContainer .section1 button.green.build'
        );
        if (btn.length === 1) {
            this.scheduler.completeTask(task.id);
            btn.trigger('click');
        } else {
            throw new TryLaterError(5 * 60, 'No upgrade button, try later');
        }
        return null;
    }
}
