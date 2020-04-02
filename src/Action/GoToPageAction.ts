import ActionController from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';

export default class GoToPageAction extends ActionController {
    static NAME = 'go_to_page';
    async run(args: Args, task: Task): Promise<any> {
        window.location.assign(args.path);
    }
}
