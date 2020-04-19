import { ActionController, registerAction } from './ActionController';
import { Args } from '../Command';
import { ActionError, GrabError, TryLaterError } from '../Errors';
import { Task } from '../Queue/TaskQueue';
import { clickBuildButton } from '../Page/BuildingPage';

@registerAction
export class BuildBuildingAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const buildTypeId = args.buildTypeId;
        if (!buildTypeId) {
            throw new ActionError(task.id, 'Unknown build type id');
        }

        try {
            clickBuildButton(buildTypeId);
        } catch (e) {
            if (e instanceof GrabError) {
                throw new TryLaterError(task.id, 15 * 60, 'No build button, try later');
            }
            throw e;
        }
    }
}
