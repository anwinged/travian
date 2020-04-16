import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { StateGrabberManager } from '../State/StateGrabberManager';

@registerAction
export class StoreVillageState extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const manager = new StateGrabberManager();
        manager.grab();
    }
}
