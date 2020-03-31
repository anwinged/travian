import { Task } from '../Storage/TaskQueue';

export default abstract class TaskController {
    abstract run(task: Task);
}
