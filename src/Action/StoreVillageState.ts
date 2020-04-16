import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { grabResources } from '../Page/ResourcesBlock';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { VillageState } from '../Storage/VillageState';

@registerAction
export class StoreVillageState extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const villageId = grabActiveVillageId();
        const resources = grabResources();
        const state = new VillageState(villageId);
        state.storeResources(resources);
    }
}
