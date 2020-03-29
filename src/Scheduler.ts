import { markPage, sleepLong, sleepShort } from './utils';
import UpgradeBuildingTask from './Task/UpgradeBuildingTask';
import GoToBuildingAction from './Action/GoToBuildingAction';
import UpgradeBuildingAction from './Action/UpgradeBuildingAction';
import { TryLaterError } from './Errors';
import { TaskQueue, ImmutableState } from './Storage/TaskQueue';
import ActionQueue from './Storage/ActionQueue';
import { Args, Command } from './Common';
import TaskQueueRenderer from './TaskQueueRenderer';

enum SleepType {
    Long,
    Short,
}

export default class Scheduler {
    private readonly version: string;
    private taskQueue: TaskQueue;
    private actionQueue: ActionQueue;
    private sleepType: SleepType;

    constructor(version: string) {
        this.version = version;
        this.taskQueue = new TaskQueue();
        this.actionQueue = new ActionQueue();
        this.sleepType = SleepType.Short;
    }

    async run() {
        await sleepShort();
        markPage('Executor', this.version);
        new TaskQueueRenderer().render(this.taskQueue.state());
        while (true) {
            await this.sleep();
            const actionItem = this.popAction();
            this.log('POP ACTION ITEM', actionItem);
            if (actionItem !== null) {
                const action = this.createAction(actionItem);
                this.log('POP ACTION', action);
                if (action) {
                    await this.runAction(action, actionItem.args);
                }
            } else {
                const taskItem = this.getTask();
                this.log('POP TASK ITEM', taskItem);
                if (taskItem !== null) {
                    const task = this.createTask(taskItem);
                    this.log('POP TASK', task);
                    if (task !== null) {
                        task.run(taskItem.args);
                    }
                }
            }
        }
    }

    private async sleep() {
        if (this.sleepType === SleepType.Long) {
            await sleepLong();
        } else {
            await sleepShort();
        }
        this.sleepType = SleepType.Short;
    }

    private nextSleepLong() {
        this.sleepType = SleepType.Long;
    }

    taskState(): ImmutableState {
        return this.taskQueue.state();
    }

    pushTask(task: Command): void {
        this.log('PUSH TASK', task);
        this.taskQueue.push(task);
    }

    pushAction(action: Command): void {
        this.log('PUSH ACTION', action);
        this.actionQueue.push(action);
    }

    scheduleActions(actions: Array<Command>): void {
        this.actionQueue.assign(actions);
    }

    completeCurrentTask() {
        this.taskQueue.next();
    }

    private getTask(): Command | null {
        return this.taskQueue.current() || this.taskQueue.next();
    }

    private createTask(taskItem: Command) {
        switch (taskItem.name) {
            case UpgradeBuildingTask.NAME:
                return new UpgradeBuildingTask(this);
        }
        this.log('UNKNOWN TASK', taskItem.name);
        return null;
    }

    private popAction() {
        const actionItem = this.actionQueue.pop();
        if (actionItem === undefined) {
            return null;
        }
        this.log('UNKNOWN ACTION', actionItem.name);
        return actionItem;
    }

    private createAction(actionItem: Command) {
        if (actionItem.name === GoToBuildingAction.NAME) {
            return new GoToBuildingAction();
        }
        if (actionItem.name === UpgradeBuildingAction.NAME) {
            return new UpgradeBuildingAction(this);
        }
        return null;
    }

    private async runAction(action, args: Args) {
        try {
            await action.run(args);
        } catch (e) {
            console.warn('ACTION ABORTED', e.message);
            if (e instanceof TryLaterError) {
                console.warn('TRY AFTER', e.seconds);
                this.actionQueue.clear();
                this.taskQueue.postpone(e.seconds);
                this.nextSleepLong();
            }
        }
    }

    private log(...args) {
        console.log('SCHEDULER:', ...args);
    }
}
