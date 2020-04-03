import { Task } from '../Storage/TaskQueue';
import { Scheduler } from '../Scheduler';

const taskMap: { [name: string]: Function | undefined } = {};

export function registerTask(constructor: Function) {
    console.log('REGISTER TASK', constructor.name);
    taskMap[constructor.name] = constructor;
}

export function createTask(
    name: string,
    scheduler: Scheduler
): TaskController | undefined {
    const storedFunction = taskMap[name];
    if (storedFunction === undefined) {
        return undefined;
    }
    const constructor = (storedFunction as unknown) as typeof TaskController;
    return new constructor(scheduler);
}

export class TaskController {
    protected scheduler: Scheduler;

    constructor(scheduler: Scheduler) {
        this.scheduler = scheduler;
    }

    async run(task: Task) {}
}
