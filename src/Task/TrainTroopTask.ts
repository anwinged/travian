import { Args, Command } from '../Command';
import { Task } from '../Queue/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { TrainTrooperAction } from '../Action/TrainTrooperAction';
import { path } from '../utils';

@registerTask
export class TrainTroopTask extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.args, taskId: task.id };

        const pathArgs = {
            newdid: args.villageId,
            gid: args.buildTypeId || undefined,
            id: args.buildId || undefined,
            s: args.tabId,
        };

        const pagePath = path('/build.php', pathArgs);

        this.scheduler.scheduleActions([
            new Command(GoToPageAction.name, { ...args, path: pagePath }),
            new Command(TrainTrooperAction.name, args),
            new Command(CompleteTaskAction.name, args),
        ]);
    }
}
