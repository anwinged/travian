import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';

@registerAction
export class ClickButtonAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const el = jQuery(args.selector);
        if (el.length === 1) {
            console.log('CLICK BUTTON', el);
            el.trigger('click');
        }
    }
}
