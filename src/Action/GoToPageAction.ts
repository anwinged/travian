import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';

@registerAction
export class GoToPageAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        window.location.assign(args.path);
    }
}
