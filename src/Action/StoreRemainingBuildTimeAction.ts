import ActionController from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';

export default class StoreRemainingBuildTimeAction extends ActionController {
    static NAME = 'store_remaining_build_time';

    async run(args: Args, task: Task): Promise<any> {
        const timer = jQuery('.buildDuration .timer');
        // if (timer.length === 1) {
        //     const remainingSeconds = +timer.val();
        // }
        return null;
    }
}
