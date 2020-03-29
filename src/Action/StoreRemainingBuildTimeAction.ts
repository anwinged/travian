import Action from './Action';
import { Args } from '../Common';

export default class StoreRemainingBuildTimeAction extends Action {
    static NAME = 'store_remaining_build_time';

    async run(args: Args): Promise<any> {
        const timer = jQuery('.buildDuration .timer');
        // if (timer.length === 1) {
        //     const remainingSeconds = +timer.val();
        // }
        return null;
    }
}
