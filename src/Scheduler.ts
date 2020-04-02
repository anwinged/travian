import { markPage, sleepShort, timestamp } from './utils';
import UpgradeBuildingTask from './Task/UpgradeBuildingTask';
import UpgradeBuildingAction from './Action/UpgradeBuildingAction';
import {
    AbortTaskError,
    BuildingQueueFullError,
    TryLaterError,
} from './Errors';
import { TaskQueue, TaskList, Task, TaskId } from './Storage/TaskQueue';
import ActionQueue from './Storage/ActionQueue';
import { Args, Command } from './Common';
import TaskQueueRenderer from './TaskQueueRenderer';
import ActionController from './Action/ActionController';
import TaskController from './Task/TaskController';
import GoToPageAction from './Action/GoToPageAction';
import CheckBuildingRemainingTimeAction from './Action/CheckBuildingRemainingTimeAction';
import SendOnAdventureTask from './Task/SendOnAdventureTask';
import GrabHeroAttributesAction from './Action/GrabHeroAttributesAction';
import { GameState } from './Storage/GameState';
import CompleteTaskAction from './Action/CompleteTaskAction';
import SendOnAdventureAction from './Action/SendOnAdventureAction';
import ClickButtonAction from './Action/ClickButtonAction';

export default class Scheduler {
    private readonly version: string;
    private taskQueue: TaskQueue;
    private actionQueue: ActionQueue;
    private gameState: GameState;

    constructor(version: string) {
        this.version = version;
        this.taskQueue = new TaskQueue();
        this.actionQueue = new ActionQueue();
        this.gameState = new GameState();
    }

    async run() {
        await sleepShort();
        markPage('Executor', this.version);

        this.renderTaskQueue();
        setInterval(() => this.renderTaskQueue(), 5 * 1000);

        this.scheduleHeroAdventure();
        setInterval(() => this.scheduleHeroAdventure(), 3600 * 1000);

        while (true) {
            await this.doLoopStep();
        }
    }

    private renderTaskQueue() {
        this.log('RENDER TASK QUEUE');
        new TaskQueueRenderer().render(this.taskQueue.seeItems());
    }

    private scheduleHeroAdventure() {
        if (!this.taskQueue.hasNamed(SendOnAdventureTask.NAME)) {
            this.taskQueue.push(
                new Command(SendOnAdventureTask.NAME, {}),
                timestamp()
            );
        }
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

        const actionCommand = this.actionQueue.pop();

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
        this.log('PROCESS TASK', task.cmd.name, task, taskController);
        if (taskController) {
            taskController.run(task);
        }
    }

    private async processActionCommand(cmd: Command, task: Task) {
        const actionController = this.createActionControllerByName(cmd.name);
        this.log('PROCESS ACTION', cmd.name, actionController);
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
            case SendOnAdventureTask.NAME:
                return new SendOnAdventureTask(this);
        }
        this.logError('TASK NOT FOUND', taskName);
        return undefined;
    }

    private createActionControllerByName(
        actonName: string
    ): ActionController | undefined {
        if (actonName === GoToPageAction.NAME) {
            return new GoToPageAction();
        }
        if (actonName === ClickButtonAction.NAME) {
            return new ClickButtonAction();
        }
        if (actonName === CompleteTaskAction.NAME) {
            return new CompleteTaskAction(this);
        }
        if (actonName === UpgradeBuildingAction.NAME) {
            return new UpgradeBuildingAction();
        }
        if (actonName === CheckBuildingRemainingTimeAction.NAME) {
            return new CheckBuildingRemainingTimeAction();
        }
        if (actonName === GrabHeroAttributesAction.NAME) {
            return new GrabHeroAttributesAction(this.gameState);
        }
        if (actonName === SendOnAdventureAction.NAME) {
            return new SendOnAdventureAction(this.gameState);
        }
        this.logError('ACTION NOT FOUND', actonName);
        return undefined;
    }

    private async runAction(action: ActionController, args: Args, task: Task) {
        try {
            await action.run(args, task);
        } catch (e) {
            console.warn('ACTION ABORTED', e.message);
            this.actionQueue.clear();
            if (e instanceof AbortTaskError) {
                console.warn('ABORT TASK', e.id);
                this.completeTask(e.id);
            }
            if (e instanceof TryLaterError) {
                console.warn('TRY', task.id, 'AFTER', e.seconds);
                this.taskQueue.postpone(task.id, timestamp() + e.seconds);
            }
            if (e instanceof BuildingQueueFullError) {
                console.warn('BUILDING QUEUE FULL, TRY ALL AFTER', e.seconds);
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
