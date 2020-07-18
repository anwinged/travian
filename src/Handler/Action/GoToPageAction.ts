import { BaseAction } from './BaseAction';
import { taskError } from '../../Errors';
import { Args } from '../../Queue/Args';
import { Task } from '../../Queue/TaskProvider';
import { registerAction } from '../ActionMap';

@registerAction
export class GoToPageAction extends BaseAction {
    async run(args: Args, task: Task): Promise<any> {
        const path = args.path || taskError('Empty path');
        window.location.assign(path);
    }
}
