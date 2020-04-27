import { ActionController, registerAction } from './ActionController';
import { Args } from '../Command';
import { Task } from '../Queue/TaskQueue';

@registerAction
export class CompleteTaskAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        this.scheduler.removeTask(task.id);
    }
}
