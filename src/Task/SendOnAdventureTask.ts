import { Args, Command } from '../Command';
import { Task } from '../Queue/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { SendOnAdventureAction } from '../Action/SendOnAdventureAction';
import { ClickButtonAction } from '../Action/ClickButtonAction';
import { path } from '../utils';

@registerTask
export class SendOnAdventureTask extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.args, taskId: task.id };
        this.scheduler.scheduleActions([
            new Command(GoToPageAction.name, {
                ...args,
                path: path('/hero.php'),
            }),
            new Command(GoToPageAction.name, {
                ...args,
                path: path('/hero.php', { t: 3 }),
            }),
            new Command(SendOnAdventureAction.name, args),
            new Command(ClickButtonAction.name, {
                ...args,
                selector: '.adventureSendButton button',
            }),
            new Command(CompleteTaskAction.name, args),
        ]);
    }
}
