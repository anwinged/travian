import { markPage, sleepShort, timestamp } from './utils';
import UpgradeBuildingTask from './Task/UpgradeBuildingTask';
import UpgradeBuildingAction from './Action/UpgradeBuildingAction';
import { BuildingQueueFullError, TryLaterError } from './Errors';
import { TaskQueue, TaskList, Task, TaskId } from './Storage/TaskQueue';
import ActionQueue from './Storage/ActionQueue';
import { Args, Command } from './Common';
import TaskQueueRenderer from './TaskQueueRenderer';
import ActionController from './Action/ActionController';
import TaskController from './Task/TaskController';
import GoToPageAction from './Action/GoToPageAction';
import CheckBuildingRemainingTimeAction from './Action/CheckBuildingRemainingTimeAction';

export default class Scheduler {
    private readonly version: string;
    private taskQueue: TaskQueue;
    private actionQueue: ActionQueue;

    constructor(version: string) {
        this.version = version;
        this.taskQueue = new TaskQueue();
        this.actionQueue = new ActionQueue();
    }

    async run() {
        await sleepShort();
        markPage('Executor', this.version);

        this.renderTaskQueue();
        setInterval(() => this.renderTaskQueue(), 5000);

        while (true) {
            await this.doLoopStep();
        }
    }

    private renderTaskQueue() {
        this.log('RENDER TASK QUEUE');
        new TaskQueueRenderer().render(this.taskQueue.seeItems());
    }

    private async doLoopStep() {
        await sleepShort();
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

    private async processTaskCommand(task: Task) {
        const taskController = this.createTaskControllerByName(task.cmd.name);
        this.log('PROCESS TASK CONTROLLER', taskController, task);
        if (taskController) {
            taskController.run(task);
        }
    }

    private async processActionCommand(cmd: Command, task: Task) {
        const actionController = this.createActionControllerByName(cmd.name);
        this.log('PROCESS ACTION CONTROLLER', cmd.name, actionController);
        if (actionController) {
            await this.runAction(actionController, cmd.args, task);
        }
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
        this.logError('TASK NOT FOUND', taskName);
        return undefined;
    }

    private popActionCommand(): Command | undefined {
        const actionItem = this.actionQueue.pop();
        if (actionItem === undefined) {
            return undefined;
        }
        return actionItem;
    }

    private createActionControllerByName(
        actonName: string
    ): ActionController | undefined {
        if (actonName === UpgradeBuildingAction.NAME) {
            return new UpgradeBuildingAction(this);
        }
        if (actonName === GoToPageAction.NAME) {
            return new GoToPageAction();
        }
        if (actonName === CheckBuildingRemainingTimeAction.NAME) {
            return new CheckBuildingRemainingTimeAction();
        }
        this.logError('ACTION NOT FOUND', actonName);
        return undefined;
    }

    private async runAction(action: ActionController, args: Args, task: Task) {
        try {
            await action.run(args, task);
        } catch (e) {
            console.warn('ACTION ABORTED', e.message);
            if (e instanceof TryLaterError) {
                console.warn('TRY', task.id, 'AFTER', e.seconds);
                this.actionQueue.clear();
                this.taskQueue.postpone(task.id, timestamp() + e.seconds);
            }
            if (e instanceof BuildingQueueFullError) {
                console.warn('BUILDING QUEUE FULL, TRY ALL AFTER', e.seconds);
                this.actionQueue.clear();
                this.taskQueue.modify(
                    t => t.cmd.name === UpgradeBuildingTask.NAME,
                    t => t.withTime(timestamp() + e.seconds)
                );
            }
        }
    }

    private log(...args) {
        console.log('SCHEDULER:', ...args);
    }

    private logError(...args) {
        console.error(...args);
    }
}
