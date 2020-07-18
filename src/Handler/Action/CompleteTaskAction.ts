import { BaseAction } from './BaseAction';
import { Args } from '../../Queue/Args';
import { registerAction } from '../ActionMap';
import { Task } from '../../Queue/Task';

@registerAction
export class CompleteTaskAction extends BaseAction {
    async run(args: Args, task: Task): Promise<any> {
        this.scheduler.completeTask(task.id);
    }
}
