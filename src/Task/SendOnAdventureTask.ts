import { Args, Command } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { GrabHeroAttributesAction } from '../Action/GrabHeroAttributesAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { SendOnAdventureAction } from '../Action/SendOnAdventureAction';
import { ClickButtonAction } from '../Action/ClickButtonAction';

@registerTask
export class SendOnAdventureTask extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.cmd.args, taskId: task.id };
        this.scheduler.scheduleActions([
            new Command(GoToPageAction.name, { ...args, path: 'hero.php' }),
            new Command(GrabHeroAttributesAction.name, args),
            new Command(GoToPageAction.name, {
                ...args,
                path: '/hero.php?t=3',
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
