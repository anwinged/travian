import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { PostponeAllBuildingsError, GrabError } from '../Errors';
import { grabActiveVillageId, grabBuildingQueueInfo } from '../Page/VillageBlock';
import { BuildingQueueInfo } from '../Game';

@registerAction
export class CheckBuildingRemainingTimeAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const info = this.grabBuildingQueueInfoOrDefault();
        if (info.seconds > 0) {
            throw new PostponeAllBuildingsError(
                task.id,
                grabActiveVillageId(),
                info.seconds + 1,
                'Building queue is full'
            );
        }
    }

    private grabBuildingQueueInfoOrDefault() {
        try {
            return grabBuildingQueueInfo();
        } catch (e) {
            if (e instanceof GrabError) {
                return new BuildingQueueInfo(0);
            }
            throw e;
        }
    }
}
