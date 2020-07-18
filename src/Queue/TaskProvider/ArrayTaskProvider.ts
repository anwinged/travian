import { TaskProvider } from './TaskProvider';
import { TaskList } from '../Task';

export class ArrayTaskProvider implements TaskProvider {
    private tasks: TaskList;

    constructor(tasks: TaskList) {
        this.tasks = tasks;
    }

    getTasks(): TaskList {
        return this.tasks;
    }

    setTasks(tasks: TaskList): void {
        this.tasks = tasks;
    }
}
