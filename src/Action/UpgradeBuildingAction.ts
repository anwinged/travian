import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { GrabError, TryLaterError } from '../Errors';
import { Task } from '../Storage/TaskQueue';
import { clickUpgradeButton } from '../Page/BuildingPage';

@registerAction
export class UpgradeBuildingAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        try {
            clickUpgradeButton();
        } catch (e) {
            if (e instanceof GrabError) {
                throw new TryLaterError(task.id, 15 * 60, 'No upgrade button, try later');
            }
            throw e;
        }
    }
}
