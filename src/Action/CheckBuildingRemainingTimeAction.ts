import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { BuildingQueueFullError } from '../Errors';
import { grabActiveVillageId, grabBuildingQueueInfo } from '../Page/VillageBlock';

@registerAction
export class CheckBuildingRemainingTimeAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const info = grabBuildingQueueInfo();
        if (info.seconds > 0) {
            throw new BuildingQueueFullError(
                task.id,
                grabActiveVillageId(),
                info.seconds + 1,
                'Building queue is full'
            );
        }
    }
}
