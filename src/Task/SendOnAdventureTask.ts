import { Task } from '../Queue/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { SendOnAdventureAction } from '../Action/SendOnAdventureAction';
import { ClickButtonAction } from '../Action/ClickButtonAction';
import { path } from '../utils';
import { Action } from '../Queue/ActionQueue';
import { Args } from '../Args';

@registerTask
export class SendOnAdventureTask extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.args, taskId: task.id };
        this.scheduler.scheduleActions([
            new Action(GoToPageAction.name, {
                ...args,
                path: path('/hero.php'),
            }),
            new Action(GoToPageAction.name, {
                ...args,
                path: path('/hero.php', { t: 3 }),
            }),
            new Action(SendOnAdventureAction.name, args),
            new Action(ClickButtonAction.name, {
                ...args,
                selector: '.adventureSendButton button',
            }),
            new Action(CompleteTaskAction.name, args),
        ]);
    }
}
