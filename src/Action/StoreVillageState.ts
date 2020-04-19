import { ActionController, registerAction } from './ActionController';
import { Args } from '../Command';
import { Task } from '../Queue/TaskQueue';
import { StateGrabberManager } from '../Grabber/StateGrabberManager';

@registerAction
export class StoreVillageState extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const manager = new StateGrabberManager();
        manager.grab();
    }
}
