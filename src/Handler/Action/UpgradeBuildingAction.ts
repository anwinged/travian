import { BaseAction } from './BaseAction';
import { GrabError, TryLaterError } from '../../Errors';
import { clickUpgradeButton } from '../../Page/BuildingPage/BuildingPage';
import { Args } from '../../Queue/Args';
import { aroundMinutes } from '../../Helpers/Time';
import { registerAction } from '../ActionMap';
import { Task } from '../../Queue/Task';

@registerAction
export class UpgradeBuildingAction extends BaseAction {
    async run(args: Args, task: Task): Promise<any> {
        try {
            this.ensureSameVillage(args);
            clickUpgradeButton();
        } catch (e) {
            if (e instanceof GrabError) {
                throw new TryLaterError(aroundMinutes(5), 'No upgrade button, try later');
            }
            throw e;
        }
    }
}
