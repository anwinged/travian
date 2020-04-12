import { Args, Command } from '../Common';
import { BuildBuildingAction } from '../Action/BuildBuildingAction';
import { CheckBuildingRemainingTimeAction } from '../Action/CheckBuildingRemainingTimeAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { GoToPageAction } from '../Action/GoToPageAction';
import { path } from '../utils';
import { Task } from '../Storage/TaskQueue';
import { TaskController, registerTask } from './TaskController';

@registerTask
export class BuildBuildingTask extends TaskController {
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
                path: path('/build.php', { newdid: args.villageId, id: args.buildId, category: args.categoryId }),
            }),
            new Command(BuildBuildingAction.name, args),
            new Command(CompleteTaskAction.name, args),
        ]);
    }
}
