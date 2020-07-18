import { TaskList } from '../Task';

export interface TaskProvider {
    getTasks(): TaskList;
    setTasks(tasks: TaskList): void;
}
