import { BaseAction } from './BaseAction';
import { GrabError, TryLaterError } from '../../Errors';
import { Args } from '../../Queue/Args';
import { clickCelebrationButton } from '../../Page/BuildingPage/GuildHallPage';
import { aroundMinutes } from '../../Helpers/Time';
import { registerAction } from '../ActionMap';
import { Task } from '../../Queue/Task';

@registerAction
export class CelebrationAction extends BaseAction {
    async run(args: Args, task: Task): Promise<any> {
        try {
            this.ensureSameVillage(args);
            clickCelebrationButton(args.celebrationIndex);
        } catch (e) {
            if (e instanceof GrabError) {
                throw new TryLaterError(aroundMinutes(60), e.message);
            }
            throw e;
        }
    }
}
