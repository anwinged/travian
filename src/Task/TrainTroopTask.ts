import { Task } from '../Queue/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { TrainTrooperAction } from '../Action/TrainTrooperAction';
import { path } from '../utils';
import { Action } from '../Queue/ActionQueue';
import { Args } from '../Queue/Args';

@registerTask
export class TrainTroopTask extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.args, taskId: task.id };

        const pathArgs = {
            newdid: args.villageId,
            gid: args.buildTypeId || undefined,
            id: args.buildId || undefined,
            s: args.sheetId,
        };

        const pagePath = path('/build.php', pathArgs);

        this.scheduler.scheduleActions([
            new Action(GoToPageAction.name, { ...args, path: pagePath }),
            new Action(TrainTrooperAction.name, args),
            new Action(CompleteTaskAction.name, args),
        ]);
    }
}
