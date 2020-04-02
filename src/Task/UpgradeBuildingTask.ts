import Scheduler from '../Scheduler';
import GoToBuildingAction from '../Action/GoToBuildingAction';
import UpgradeBuildingAction from '../Action/UpgradeBuildingAction';
import { Command } from '../Common';
import { Task } from '../Storage/TaskQueue';
import TaskController from './TaskController';
import GoToPageAction from '../Action/GoToPageAction';
import CheckBuildingRemainingTimeAction from '../Action/CheckBuildingRemainingTimeAction';

export default class UpgradeBuildingTask extends TaskController {
    static NAME = 'upgrade_building';
    private scheduler: Scheduler;

    constructor(scheduler: Scheduler) {
        super();
        this.scheduler = scheduler;
    }

    run(task: Task) {
        console.log('RUN', UpgradeBuildingTask.NAME, 'with', task);
        const args = { ...task.cmd.args, taskId: task.id };
        this.scheduler.scheduleActions([
            new Command(GoToPageAction.NAME, { ...args, path: '/dorf1.php' }),
            new Command(CheckBuildingRemainingTimeAction.NAME, args),
            new Command(GoToBuildingAction.NAME, args),
            new Command(UpgradeBuildingAction.NAME, args),
        ]);
    }
}
