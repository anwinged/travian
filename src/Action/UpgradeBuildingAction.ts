import { ActionController, registerAction } from './ActionController';
import { GrabError, TryLaterError } from '../Errors';
import { Task } from '../Queue/TaskQueue';
import { clickUpgradeButton } from '../Page/BuildingPage';
import { aroundMinutes } from '../utils';
import { Args } from '../Args';

@registerAction
export class UpgradeBuildingAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        this.ensureSameVillage(args, task);

        try {
            clickUpgradeButton();
        } catch (e) {
            if (e instanceof GrabError) {
                throw new TryLaterError(aroundMinutes(5), 'No upgrade button, try later');
            }
            throw e;
        }
    }
}
