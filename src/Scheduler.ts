import { markPage, sleepLong, sleepShort, timestamp } from './utils';
import UpgradeBuildingTask from './Task/UpgradeBuildingTask';
import GoToBuildingAction from './Action/GoToBuildingAction';
import UpgradeBuildingAction from './Action/UpgradeBuildingAction';
import { TryLaterError } from './Errors';
import { TaskQueue, TaskList, Task, TaskId } from './Storage/TaskQueue';
import ActionQueue from './Storage/ActionQueue';
import { Args, Command } from './Common';
import TaskQueueRenderer from './TaskQueueRenderer';
import ActionController from './Action/ActionController';
import TaskController from './Task/TaskController';

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
        new TaskQueueRenderer().render(this.taskQueue.seeItems());

        while (true) {
            await this.doLoopStep();
        }
    }

    private async doLoopStep() {
        await this.sleep();
        const currentTs = timestamp();
        const taskCommand = this.taskQueue.get(currentTs);

        // текущего таска нет, очищаем очередь действий по таску
        if (taskCommand === undefined) {
            this.log('NO ACTIVE TASK');
            this.actionQueue.clear();
            return;
        }

        const actionCommand = this.popActionCommand();

        this.log('CURRENT TASK', taskCommand);
        this.log('CURRENT ACTION', actionCommand);

        if (actionCommand) {
            return await this.processActionCommand(actionCommand, taskCommand);
        }

        if (taskCommand) {
            return await this.processTaskCommand(taskCommand);
        }
    }

    private async processActionCommand(cmd: Command, task: Task) {
        const actionController = this.createActionControllerByName(cmd.name);
        this.log('PROCESS ACTION CTR', actionController);
        if (actionController) {
            await this.runAction(actionController, cmd.args, task);
        }
    }

    private async processTaskCommand(task: Task) {
        const taskController = this.createTaskControllerByName(task.cmd.name);
        this.log('PROCESS TASK CTR', taskController, task);
        taskController?.run(task);
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

    getTaskItems(): TaskList {
        return this.taskQueue.seeItems();
    }

    completeTask(id: TaskId) {
        this.taskQueue.complete(id);
    }

    scheduleTask(task: Command): void {
        this.log('PUSH TASK', task);
        this.taskQueue.push(task, timestamp());
    }

    scheduleActions(actions: Array<Command>): void {
        this.actionQueue.assign(actions);
    }

    private createTaskControllerByName(
        taskName: string
    ): TaskController | undefined {
        switch (taskName) {
            case UpgradeBuildingTask.NAME:
                return new UpgradeBuildingTask(this);
        }
        this.log('UNKNOWN TASK', taskName);
        return undefined;
    }

    private popActionCommand(): Command | undefined {
        const actionItem = this.actionQueue.pop();
        if (actionItem === undefined) {
            return undefined;
        }
        this.log('UNKNOWN ACTION', actionItem.name);
        return actionItem;
    }

    private createActionControllerByName(
        actonName: string
    ): ActionController | undefined {
        if (actonName === GoToBuildingAction.NAME) {
            return new GoToBuildingAction();
        }
        if (actonName === UpgradeBuildingAction.NAME) {
            return new UpgradeBuildingAction(this);
        }
        return undefined;
    }

    private async runAction(action: ActionController, args: Args, task: Task) {
        try {
            await action.run(args, task);
        } catch (e) {
            console.warn('ACTION ABORTED', e.message);
            if (e instanceof TryLaterError) {
                console.warn('TRY AFTER', e.seconds);
                this.actionQueue.clear();
                this.taskQueue.postpone(task.id, e.seconds);
                this.nextSleepLong();
            }
        }
    }

    private log(...args) {
        console.log('SCHEDULER:', ...args);
    }
}
