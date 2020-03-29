import Scheduler from '../Scheduler';
import GoToBuildingAction from '../Action/GoToBuildingAction';
import UpgradeBuildingAction from '../Action/UpgradeBuildingAction';
import { QueueItem } from '../Queue';

export default class UpgradeBuildingTask {
    static NAME = 'upgrade_building';
    private scheduler: Scheduler;

    constructor(scheduler: Scheduler) {
        this.scheduler = scheduler;
    }

    run(args) {
        console.log('RUN', UpgradeBuildingTask.NAME, 'with', args);
        this.scheduler.pushAction(new QueueItem(GoToBuildingAction.NAME, args));
        this.scheduler.pushAction(
            new QueueItem(UpgradeBuildingAction.NAME, args)
        );
    }
}
