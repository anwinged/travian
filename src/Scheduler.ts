import { markPage, sleepLong, sleepShort } from './utils';
import UpgradeBuildingTask from './Task/UpgradeBuildingTask';
import GoToBuildingAction from './Action/GoToBuildingAction';
import UpgradeBuildingAction from './Action/UpgradeBuildingAction';
import { TryLaterError } from './Errors';
import { TaskQueue, State } from './Storage/TaskQueue';
import ActionQueue from './Storage/ActionQueue';
import { Args, Command } from './Common';
import TaskQueueRenderer from './TaskQueueRenderer';

export default class Scheduler {
    taskQueue: TaskQueue;
    actionQueue: ActionQueue;

    constructor() {
        this.taskQueue = new TaskQueue();
        this.actionQueue = new ActionQueue();
    }

    async run() {
        await sleepShort();
        markPage('Executor');
        new TaskQueueRenderer().render(this.taskQueue.state());
        while (true) {
            await sleepLong();
            const actionItem = this.popAction();
            this.log('POP ACTION ITEM', actionItem);
            if (actionItem !== null) {
                const action = this.createAction(actionItem);
                this.log('POP ACTION', action);
                if (action) {
                    await this.runAction(action, actionItem.args);
                }
            } else {
                const taskItem = this.popTask();
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

    private popTask(): Command | null {
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
            return new UpgradeBuildingAction();
        }
        return null;
    }

    private async runAction(action, args: Args) {
        try {
            await action.run(args);
        } catch (e) {
            console.warn('ACTION ERROR', e);
            if (e instanceof TryLaterError) {
                console.warn('TRY AFTER', e.seconds);
                this.actionQueue.clear();
                this.taskQueue.postpone(e.seconds);
            }
        }
    }

    private log(...args) {
        console.log('SCHEDULER:', ...args);
    }
}
