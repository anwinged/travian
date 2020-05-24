import { Scheduler } from '../Scheduler';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { Action } from '../Queue/ActionQueue';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';
import { VillageFactory } from '../VillageFactory';

export type ActionDefinition = [string] | [string, Args];

export class TaskController {
    protected readonly scheduler: Scheduler;
    protected readonly factory: VillageFactory;

    constructor(scheduler: Scheduler, factory: VillageFactory) {
        this.scheduler = scheduler;
        this.factory = factory;
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
            if (def.length === 1) {
                commands.push(new Action(def[0], args));
            } else {
                commands.push(new Action(def[0], { ...args, ...def[1] }));
            }
        }
        commands.push(new Action(CompleteTaskAction.name, args));
        return commands;
    }
}
