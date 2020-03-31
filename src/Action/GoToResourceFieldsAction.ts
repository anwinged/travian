import ActionController from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';

export default class GoToResourceFieldsAction extends ActionController {
    static NAME = 'go_to_resource_fields';
    async run(args: Args, task: Task): Promise<any> {
        window.location.assign('/dorf1.php');
    }
}
