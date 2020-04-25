import { Task } from '../Queue/TaskQueue';
import { Scheduler } from '../Scheduler';
import { Args, Command } from '../Command';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';

const taskMap: { [name: string]: Function | undefined } = {};

export function registerTask(constructor: Function) {
    taskMap[constructor.name] = constructor;
}

export function createTask(name: string, scheduler: Scheduler): TaskController | undefined {
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
        const commands: Array<Command> = [];
        for (let def of this.defineActions(task)) {
            commands.push(new Command(def[0], { ...args, ...def[1] }));
        }
        commands.push(new Command(CompleteTaskAction.name, args));
        return commands;
    }
}
