import { BuildBuildingAction } from '../Action/BuildBuildingAction';
import { CheckBuildingRemainingTimeAction } from '../Action/CheckBuildingRemainingTimeAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { GoToPageAction } from '../Action/GoToPageAction';
import { path } from '../utils';
import { Task } from '../Queue/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { Action } from '../Queue/ActionQueue';
import { Args } from '../Args';

@registerTask
export class BuildBuildingTask extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.args, taskId: task.id };
        this.scheduler.scheduleActions([
            new Action(GoToPageAction.name, {
                ...args,
                path: path('/dorf1.php', { newdid: args.villageId }),
            }),
            new Action(CheckBuildingRemainingTimeAction.name, args),
            new Action(GoToPageAction.name, {
                ...args,
                path: path('/build.php', { newdid: args.villageId, id: args.buildId, category: args.categoryId }),
            }),
            new Action(BuildBuildingAction.name, args),
            new Action(CompleteTaskAction.name, args),
        ]);
    }
}
