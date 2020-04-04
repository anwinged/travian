import { Args, Command } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { TrainTrooperAction } from '../Action/TrainTrooperAction';

@registerTask
export class TrainTroopTask extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.cmd.args, taskId: task.id };
        this.scheduler.scheduleActions([
            new Command(GoToPageAction.name, { ...args, path: '/build.php?id=' + args.buildId }),
            new Command(TrainTrooperAction.name, args),
            new Command(CompleteTaskAction.name, args),
        ]);
    }
}
