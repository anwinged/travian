import { ActionController, registerAction } from './ActionController';
import { Args } from '../Command';
import { Task } from '../Queue/TaskQueue';
import { AbortTaskError } from '../Errors';

@registerAction
export class GoToPageAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        if (!args.path) {
            throw new AbortTaskError('No path');
        }
        window.location.assign(args.path);
    }
}
