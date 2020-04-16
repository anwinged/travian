import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { DataStorage } from '../Storage/DataStorage';
import { Scheduler } from '../Scheduler';

const actionMap: { [name: string]: Function | undefined } = {};

export function registerAction(constructor: Function) {
    actionMap[constructor.name] = constructor;
}

export function createAction(name: string, scheduler: Scheduler): ActionController | undefined {
    const storedFunction = actionMap[name];
    if (storedFunction === undefined) {
        return undefined;
    }
    const constructor = (storedFunction as unknown) as typeof ActionController;
    return new constructor(scheduler);
}

export class ActionController {
    protected scheduler: Scheduler;
    constructor(scheduler: Scheduler) {
        this.scheduler = scheduler;
    }

    async run(args: Args, task: Task) {}
}
