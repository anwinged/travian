import Scheduler from '../Scheduler';
import { Args, Command } from '../Common';
import { Task } from '../Storage/TaskQueue';
import TaskController from './TaskController';
import GoToPageAction from '../Action/GoToPageAction';
import GrabHeroAttributesAction from '../Action/GrabHeroAttributesAction';
import CompleteTaskAction from '../Action/CompleteTaskAction';
import SendOnAdventureAction from '../Action/SendOnAdventureAction';
import ClickButtonAction from '../Action/ClickButtonAction';

export default class SendOnAdventureTask extends TaskController {
    static NAME = 'send_on_adventure';
    private scheduler: Scheduler;

    constructor(scheduler: Scheduler) {
        super();
        this.scheduler = scheduler;
    }

    name(): string {
        return SendOnAdventureTask.NAME;
    }

    run(task: Task) {
        const args: Args = { ...task.cmd.args, taskId: task.id };
        this.scheduler.scheduleActions([
            new Command(GoToPageAction.NAME, { ...args, path: 'hero.php' }),
            new Command(GrabHeroAttributesAction.NAME, args),
            new Command(GoToPageAction.NAME, {
                ...args,
                path: '/hero.php?t=3',
            }),
            new Command(SendOnAdventureAction.NAME, args),
            new Command(ClickButtonAction.NAME, {
                ...args,
                selector: '.adventureSendButton button',
            }),
            new Command(CompleteTaskAction.NAME, args),
        ]);
    }
}
