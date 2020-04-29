import { ActionController, registerAction } from './ActionController';
import { AbortTaskError } from '../Errors';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';

@registerAction
export class GoToPageAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        if (!args.path) {
            throw new AbortTaskError('No path');
        }
        window.location.assign(args.path);
    }
}
