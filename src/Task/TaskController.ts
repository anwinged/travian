import { Task } from '../Queue/TaskQueue';
import { Scheduler } from '../Scheduler';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { Action } from '../Queue/ActionQueue';
import { Args } from '../Args';

const taskMap: { [name: string]: Function | undefined } = {};

export function registerTask(constructor: Function) {
    taskMap[constructor.name] = constructor;
}

export function createTaskHandler(name: string, scheduler: Scheduler): TaskController | undefined {
    const storedFunction = taskMap[name];
    if (storedFunction === undefined) {
        return undefined;
    }
    const constructor = (storedFunction as unknown) as typeof TaskController;
    return new constructor(scheduler);
}

export type ActionDefinition = [string, Args];

export class TaskController {
    protected scheduler: Scheduler;

    constructor(scheduler: Scheduler) {
        this.scheduler = scheduler;
    }

    async run(task: Task) {
        const commands = this.createCommands(task);
        this.scheduler.scheduleActions(commands);
    }

    defineActions(task: Task): Array<ActionDefinition> {
        return [];
    }

    private createCommands(task: Task) {
        const args: Args = { ...task.args, taskId: task.id };
        const commands: Array<Action> = [];
        for (let def of this.defineActions(task)) {
            commands.push(new Action(def[0], { ...args, ...def[1] }));
        }
        commands.push(new Action(CompleteTaskAction.name, args));
        return commands;
    }
}
