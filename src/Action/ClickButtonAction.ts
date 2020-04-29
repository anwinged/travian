import { ActionController, registerAction } from './ActionController';
import { AbortTaskError } from '../Errors';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';

@registerAction
export class ClickButtonAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        if (!args.selector) {
            throw new AbortTaskError('No selector');
        }
        const el = jQuery(args.selector);
        if (el.length === 1) {
            console.log('CLICK BUTTON', el);
            el.trigger('click');
        }
    }
}
