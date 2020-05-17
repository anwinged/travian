import { ActionController, registerAction } from './ActionController';
import { GrabError, taskError, TryLaterError } from '../Errors';
import { clickBuildButton } from '../Page/BuildingPage/BuildingPage';
import { aroundMinutes } from '../utils';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';

@registerAction
export class BuildBuildingAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        try {
            this.ensureSameVillage(args, task);
            this.ensureBuildingQueueIsEmpty();
            const buildTypeId = args.buildTypeId || taskError('Undefined build type id');
            clickBuildButton(buildTypeId);
        } catch (e) {
            if (e instanceof GrabError) {
                throw new TryLaterError(aroundMinutes(5), 'No upgrade button, try later');
            }
            throw e;
        }
    }
}
