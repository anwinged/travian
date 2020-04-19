import { Args, Command } from '../Command';
import { Task } from '../Queue/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { path } from '../utils';
import { UpgradeResourceToLevel } from '../Action/UpgradeResourceToLevel';

@registerTask
export class ResourcesToLevel extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.args, taskId: task.id };
        this.scheduler.scheduleActions([
            new Command(GoToPageAction.name, {
                ...args,
                path: path('/dorf1.php', { newdid: args.villageId }),
            }),
            new Command(UpgradeResourceToLevel.name, args),
            new Command(CompleteTaskAction.name, args),
        ]);
    }
}
