import { ActionController, registerAction } from './ActionController';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';

@registerAction
export class CompleteTaskAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        this.scheduler.completeTask(task.id);
    }
}
