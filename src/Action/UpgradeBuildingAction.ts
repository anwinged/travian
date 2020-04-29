import { ActionController, registerAction } from './ActionController';
import { GrabError, TryLaterError } from '../Errors';
import { clickUpgradeButton } from '../Page/BuildingPage';
import { aroundMinutes } from '../utils';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';

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
