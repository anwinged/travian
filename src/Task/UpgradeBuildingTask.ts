import Scheduler from '../Scheduler';
import { UpgradeBuildingAction } from '../Action/UpgradeBuildingAction';
import { Args, Command } from '../Common';
import { Task } from '../Storage/TaskQueue';
import TaskController from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CheckBuildingRemainingTimeAction } from '../Action/CheckBuildingRemainingTimeAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';

export default class UpgradeBuildingTask extends TaskController {
    static NAME = 'upgrade_building';
    private scheduler: Scheduler;

    constructor(scheduler: Scheduler) {
        super();
        this.scheduler = scheduler;
    }

    run(task: Task) {
        console.log('RUN', UpgradeBuildingTask.NAME, 'with', task);
        const args: Args = { ...task.cmd.args, taskId: task.id };
        this.scheduler.scheduleActions([
            new Command(GoToPageAction.name, { ...args, path: '/dorf1.php' }),
            new Command(CheckBuildingRemainingTimeAction.name, args),
            new Command(GoToPageAction.name, {
                ...args,
                path: '/build.php?id=' + args.id,
            }),
            new Command(UpgradeBuildingAction.name, args),
            new Command(CompleteTaskAction.name, args),
        ]);
    }
}
