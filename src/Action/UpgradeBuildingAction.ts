import { ActionController, registerAction } from './ActionController';
import { Args } from '../Command';
import { ActionError, GrabError, PostponeAllBuildingsError } from '../Errors';
import { Task } from '../Queue/TaskQueue';
import { clickUpgradeButton } from '../Page/BuildingPage';

@registerAction
export class UpgradeBuildingAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        let villageId = args.villageId;
        if (villageId === undefined) {
            throw new ActionError(task.id, 'No village id');
        }

        try {
            clickUpgradeButton();
        } catch (e) {
            if (e instanceof GrabError) {
                throw new PostponeAllBuildingsError(task.id, villageId, 15 * 60, 'No upgrade button, try later');
            }
            throw e;
        }
    }
}
