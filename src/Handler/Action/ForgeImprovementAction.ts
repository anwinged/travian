import { BaseAction } from './BaseAction';
import { GrabError, taskError, TryLaterError } from '../../Errors';
import { Args } from '../../Queue/Args';
import { Task } from '../../Queue/TaskProvider';
import { clickResearchButton } from '../../Page/BuildingPage/ForgePage';
import { aroundMinutes } from '../../Helpers/Time';
import { registerAction } from '../ActionMap';

@registerAction
export class ForgeImprovementAction extends BaseAction {
    async run(args: Args, task: Task): Promise<any> {
        try {
            this.ensureSameVillage(args);
            const unitId = args.unitId || taskError('No unitId in args');
            clickResearchButton(unitId);
        } catch (e) {
            if (e instanceof GrabError) {
                throw new TryLaterError(aroundMinutes(15), e.message);
            }
            throw e;
        }
    }
}
