import ActionController from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';

export default class ClickButtonAction extends ActionController {
    static NAME = 'click_button';
    async run(args: Args, task: Task): Promise<any> {
        const el = jQuery(args.selector);
        if (el.length === 1) {
            console.log('CLICK BUTTON', el);
            el.trigger('click');
        }
    }
}
