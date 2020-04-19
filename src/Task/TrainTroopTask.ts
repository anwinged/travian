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
        this.scheduler.scheduleActions([
            new Command(GoToPageAction.name, {
                ...args,
                path: path('/build.php', { newdid: args.villageId, id: args.buildId }),
            }),
            new Command(TrainTrooperAction.name, args),
            new Command(CompleteTaskAction.name, args),
        ]);
    }
}
