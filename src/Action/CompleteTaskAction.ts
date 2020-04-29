import { ActionController, registerAction } from './ActionController';
import { Task } from '../Queue/TaskQueue';
import { Args } from '../Args';

@registerAction
export class CompleteTaskAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        this.scheduler.removeTask(task.id);
    }
}
