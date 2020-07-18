import { BaseAction } from './BaseAction';
import { GrabError, taskError, TryLaterError } from '../../Errors';
import { clickBuildButton } from '../../Page/BuildingPage/BuildingPage';
import { Args } from '../../Queue/Args';
import { aroundMinutes } from '../../Helpers/Time';
import { registerAction } from '../ActionMap';
import { Task } from '../../Queue/Task';

@registerAction
export class BuildBuildingAction extends BaseAction {
    async run(args: Args, task: Task): Promise<any> {
        try {
            this.ensureSameVillage(args);
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
