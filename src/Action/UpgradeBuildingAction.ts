import Action from './Action';
import { Args } from '../Common';
import { TryLaterError } from '../Errors';
import Scheduler from '../Scheduler';

export default class UpgradeBuildingAction extends Action {
    static NAME = 'upgrade_building';
    private scheduler: Scheduler;

    constructor(scheduler: Scheduler) {
        super();
        this.scheduler = scheduler;
    }

    async run(args: Args): Promise<any> {
        const btn = jQuery(
            '.upgradeButtonsContainer .section1 button.green.build'
        );
        if (btn.length === 1) {
            this.scheduler.completeCurrentTask();
            btn.trigger('click');
        } else {
            throw new TryLaterError(60, 'No upgrade button, try later');
        }
        return null;
    }
}
