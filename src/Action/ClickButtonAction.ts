import { ActionController, registerAction } from './ActionController';
import { AbortTaskError, taskError } from '../Errors';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';

@registerAction
export class ClickButtonAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const selector = args.selector || taskError('No selector');
        const el = jQuery(selector);
        if (el.length === 1) {
            console.log('CLICK BUTTON', el);
            el.trigger('click');
        }
    }
}
