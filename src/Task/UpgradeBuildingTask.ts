import Scheduler from '../Scheduler';
import GoToBuildingAction from '../Action/GoToBuildingAction';
import UpgradeBuildingAction from '../Action/UpgradeBuildingAction';
import { Args, Command } from '../Common';

export default class UpgradeBuildingTask {
    static NAME = 'upgrade_building';
    private scheduler: Scheduler;

    constructor(scheduler: Scheduler) {
        this.scheduler = scheduler;
    }

    run(args: Args) {
        console.log('RUN', UpgradeBuildingTask.NAME, 'with', args);
        this.scheduler.scheduleActions([
            new Command(GoToBuildingAction.NAME, args),
            new Command(UpgradeBuildingAction.NAME, args),
        ]);
    }
}
