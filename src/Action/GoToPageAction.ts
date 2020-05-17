import { ActionController, registerAction } from './ActionController';
import { taskError } from '../Errors';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';

@registerAction
export class GoToPageAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const path = args.path || taskError('Empty path');
        window.location.assign(path);
    }
}
