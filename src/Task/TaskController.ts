import { Task } from '../Storage/TaskQueue';

export default abstract class TaskController {
    abstract name(): string;
    abstract run(task: Task);
}
