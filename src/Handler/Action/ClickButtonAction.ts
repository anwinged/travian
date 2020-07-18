import { BaseAction } from './BaseAction';
import { taskError } from '../../Errors';
import { Args } from '../../Queue/Args';
import { registerAction } from '../ActionMap';
import { Task } from '../../Queue/Task';

@registerAction
export class ClickButtonAction extends BaseAction {
    async run(args: Args, task: Task): Promise<any> {
        const selector = args.selector || taskError('No selector');
        const el = jQuery(selector);
        if (el.length === 1) {
            console.log('CLICK BUTTON', el);
            el.trigger('click');
        }
    }
}
