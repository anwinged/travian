import ActionController from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';

export default class GoToBuildingAction extends ActionController {
    static NAME = 'go_to_building';

    async run(args: Args, task: Task): Promise<any> {
        window.location.assign('/build.php?id=' + args.id);
        return null;
    }
}
