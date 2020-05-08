import { TaskController } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { TrainTrooperAction } from '../Action/TrainTrooperAction';
import { Action } from '../Queue/ActionQueue';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';
import { path } from '../Helpers/Path';
import { registerTask, TaskType } from './TaskMap';

@registerTask({ type: TaskType.TrainUnit })
export class TrainTroopTask extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.args, taskId: task.id };

        const pathArgs = {
            newdid: args.villageId,
            gid: args.buildTypeId || undefined,
            id: args.buildId || undefined,
            s: args.sheetId,
        };

        this.scheduler.scheduleActions([
            new Action(GoToPageAction.name, { ...args, path: path('/build.php', pathArgs) }),
            new Action(TrainTrooperAction.name, args),
            new Action(CompleteTaskAction.name, args),
        ]);
    }
}
