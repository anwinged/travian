import { Scheduler } from '../../Scheduler';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { Args } from '../../Queue/Args';
import { VillageFactory } from '../../Village/VillageFactory';
import { Action } from '../../Queue/Action';
import { Task } from '../../Queue/Task';

export interface ActionDefinition {
    name: string;
    args?: Args;
}

export class BaseTask {
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
        const actions: Array<Action> = [];
        for (let def of this.defineActions(task)) {
            actions.push({
                name: def.name,
                args: def.args ? { ...args, ...def.args } : args,
            });
        }
        actions.push({ name: CompleteTaskAction.name, args });
        return actions;
    }
}
