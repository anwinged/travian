import { UpgradeBuildingAction } from '../Action/UpgradeBuildingAction';
import { Args, Command } from '../Command';
import { Task } from '../Queue/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CheckBuildingRemainingTimeAction } from '../Action/CheckBuildingRemainingTimeAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { path } from '../utils';

@registerTask
export class UpgradeBuildingTask extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.args, taskId: task.id };
        this.scheduler.scheduleActions([
            new Command(GoToPageAction.name, {
                ...args,
                path: path('/dorf1.php', { newdid: args.villageId }),
            }),
            new Command(CheckBuildingRemainingTimeAction.name, args),
            new Command(GoToPageAction.name, {
                ...args,
                path: path('/build.php', { newdid: args.villageId, id: args.buildId }),
            }),
            new Command(UpgradeBuildingAction.name, args),
            new Command(CompleteTaskAction.name, args),
        ]);
    }
}
