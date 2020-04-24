import { Args, Command } from '../Command';
import { Task } from '../Queue/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { path } from '../utils';
import { SendResourcesAction } from '../Action/SendResourcesAction';
import { ClickButtonAction } from '../Action/ClickButtonAction';

@registerTask
export class SendResourcesTask extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.args, taskId: task.id };

        const pathArgs = {
            newdid: args.villageId,
            gid: args.buildTypeId || undefined,
            id: args.buildId || undefined,
            t: args.tabId,
        };

        const pagePath = path('/build.php', pathArgs);

        this.scheduler.scheduleActions([
            new Command(GoToPageAction.name, { ...args, path: pagePath }),
            new Command(SendResourcesAction.name, args),
            new Command(ClickButtonAction.name, { ...args, selector: '#enabledButton.green.sendRessources' }),
            new Command(CompleteTaskAction.name, args),
        ]);
    }
}
