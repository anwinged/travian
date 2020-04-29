import { ActionController, registerAction } from './ActionController';
import { ActionError, GrabError, TryLaterError } from '../Errors';
import { Task } from '../Queue/TaskQueue';
import { clickBuildButton } from '../Page/BuildingPage';
import { aroundMinutes } from '../utils';
import { Args } from '../Queue/Args';

@registerAction
export class BuildBuildingAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        this.ensureSameVillage(args, task);

        const buildTypeId = args.buildTypeId;
        if (buildTypeId === undefined) {
            throw new ActionError('Undefined build type id');
        }

        try {
            clickBuildButton(buildTypeId);
        } catch (e) {
            if (e instanceof GrabError) {
                throw new TryLaterError(aroundMinutes(5), 'No upgrade button, try later');
            }
            throw e;
        }
    }
}
