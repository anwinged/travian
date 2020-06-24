import { ActionController, registerAction } from './ActionController';
import { GrabError, TryLaterError } from '../Errors';
import { aroundMinutes } from '../utils';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';
import { clickCelebrationButton } from '../Page/BuildingPage/GuildHallPage';

@registerAction
export class CelebrationAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        try {
            this.ensureSameVillage(args, task);
            clickCelebrationButton(args.celebrationIndex);
        } catch (e) {
            if (e instanceof GrabError) {
                throw new TryLaterError(aroundMinutes(60), e.message);
            }
            throw e;
        }
    }
}
