import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';

@registerAction
export class CompleteTaskAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        this.scheduler.completeTask(task.id);
    }
}
