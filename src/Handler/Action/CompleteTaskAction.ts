import { BaseAction } from './BaseAction';
import { Args } from '../../Queue/Args';
import { Task } from '../../Queue/TaskProvider';
import { registerAction } from '../ActionMap';

@registerAction
export class CompleteTaskAction extends BaseAction {
    async run(args: Args, task: Task): Promise<any> {
        this.scheduler.completeTask(task.id);
    }
}
