import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { TryLaterError } from '../Errors';
import { Task } from '../Storage/TaskQueue';

@registerAction
export class UpgradeBuildingAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const btn = jQuery(
            '.upgradeButtonsContainer .section1 button.green.build'
        );

        if (btn.length !== 1) {
            throw new TryLaterError(5 * 60, 'No upgrade button, try later');
        }

        btn.trigger('click');
    }
}
