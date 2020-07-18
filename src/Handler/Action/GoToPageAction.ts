import { BaseAction } from './BaseAction';
import { taskError } from '../../Errors';
import { Args } from '../../Queue/Args';
import { registerAction } from '../ActionMap';
import { Task } from '../../Queue/Task';

@registerAction
export class GoToPageAction extends BaseAction {
    async run(args: Args, task: Task): Promise<any> {
        const path = args.path || taskError('Empty path');
        window.location.assign(path);
    }
}
