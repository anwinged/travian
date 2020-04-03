import { markPage, sleepShort, timestamp } from './utils';
import UpgradeBuildingTask from './Task/UpgradeBuildingTask';
import {
    AbortTaskError,
    BuildingQueueFullError,
    TryLaterError,
} from './Errors';
import { Task, TaskId, TaskList, TaskQueue } from './Storage/TaskQueue';
import ActionQueue from './Storage/ActionQueue';
import { Args, Command } from './Common';
import TaskQueueRenderer from './TaskQueueRenderer';
import { ActionController, createAction } from './Action/ActionController';
import TaskController from './Task/TaskController';
import SendOnAdventureTask from './Task/SendOnAdventureTask';
import { GameState } from './Storage/GameState';

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
        this.log(
            'PROCESS TASK',
            taskController?.constructor.name,
            task,
            taskController
        );
        if (taskController) {
            taskController.run(task);
        }
    }

    private async processActionCommand(cmd: Command, task: Task) {
        const actionController = this.createActionControllerByName(cmd.name);
        this.log(
            'PROCESS ACTION',
            actionController?.constructor.name,
            actionController
        );
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
        actionName: string
    ): ActionController | undefined {
        const action = createAction(actionName, this.gameState, this);
        if (!action) {
            this.logError('ACTION NOT FOUND', actionName);
            return undefined;
        }
        return action;
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
