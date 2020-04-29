import { ActionController, registerAction } from './ActionController';
import { Task } from '../Queue/TaskQueue';
import { AbortTaskError } from '../Errors';
import { Args } from '../Queue/Args';

@registerAction
export class GoToPageAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        if (!args.path) {
            throw new AbortTaskError('No path');
        }
        window.location.assign(args.path);
    }
}
