import { ActionController, registerAction } from './ActionController';
import { GrabError, taskError, TryLaterError } from '../Errors';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';
import { clickResearchButton } from '../Page/BuildingPage/ForgePage';
import { aroundMinutes } from '../Helpers/Time';

@registerAction
export class ForgeImprovementAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        try {
            this.ensureSameVillage(args, task);
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
