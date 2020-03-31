import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';

export default abstract class ActionController {
    abstract async run(args: Args, task: Task);
}
