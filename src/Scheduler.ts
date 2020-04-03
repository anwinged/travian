import { markPage, sleepShort, timestamp } from './utils';
import { UpgradeBuildingTask } from './Task/UpgradeBuildingTask';
import {
    AbortTaskError,
    BuildingQueueFullError,
    TryLaterError,
} from './Errors';
import { Task, TaskId, TaskList, TaskQueue } from './Storage/TaskQueue';
import ActionQueue from './Storage/ActionQueue';
import { Command } from './Common';
import TaskQueueRenderer from './TaskQueueRenderer';
import { createAction } from './Action/ActionController';
import { createTask } from './Task/TaskController';
import { SendOnAdventureTask } from './Task/SendOnAdventureTask';
import { GameState } from './Storage/GameState';

export class Scheduler {
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
        if (!this.taskQueue.hasNamed(SendOnAdventureTask.name)) {
            this.taskQueue.push(
                new Command(SendOnAdventureTask.name, {}),
                timestamp()
            );
        }
    }

    private async doLoopStep() {
        await sleepShort();
        const currentTs = timestamp();
        const taskCommand = this.taskQueue.get(currentTs);

        // текущего таска нет, очищаем очередь действий по таску
        if (!taskCommand) {
            this.log('NO ACTIVE TASK');
            this.actionQueue.clear();
            return;
        }

        const actionCommand = this.actionQueue.pop();

        this.log('CURRENT TASK', taskCommand);
        this.log('CURRENT ACTION', actionCommand);

        try {
            if (actionCommand) {
                return await this.processActionCommand(
                    actionCommand,
                    taskCommand
                );
            }

            if (taskCommand) {
                return await this.processTaskCommand(taskCommand);
            }
        } catch (e) {
            this.handleError(e);
        }
    }

    private async processActionCommand(cmd: Command, task: Task) {
        const actionController = createAction(cmd.name, this.gameState, this);
        this.log('PROCESS ACTION', cmd.name, actionController);
        if (actionController) {
            await actionController.run(cmd.args, task);
        } else {
            this.logError('ACTION NOT FOUND', cmd.name);
        }
    }

    private async processTaskCommand(task: Task) {
        const taskController = createTask(task.cmd.name, this);
        this.log('PROCESS TASK', task.cmd.name, task, taskController);
        if (taskController) {
            await taskController.run(task);
        } else {
            this.logError('TASK NOT FOUND', task.cmd.name);
        }
    }

    private handleError(err: Error) {
        this.logWarn('ACTION ABORTED', err.message);
        this.actionQueue.clear();

        if (err instanceof AbortTaskError) {
            this.logWarn('ABORT TASK', err.taskId);
            this.completeTask(err.taskId);
            return;
        }

        if (err instanceof TryLaterError) {
            this.logWarn('TRY', err.taskId, 'AFTER', err.seconds);
            this.taskQueue.postpone(err.taskId, timestamp() + err.seconds);
            return;
        }

        if (err instanceof BuildingQueueFullError) {
            this.logWarn('BUILDING QUEUE FULL, TRY ALL AFTER', err.seconds);
            this.taskQueue.modify(
                t => t.cmd.name === UpgradeBuildingTask.name,
                t => t.withTime(timestamp() + err.seconds)
            );
            return;
        }

        throw err;
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

    private log(...args) {
        console.log('SCHEDULER:', ...args);
    }

    private logWarn(...args) {
        console.warn('SCHEDULER:', ...args);
    }

    private logError(...args) {
        console.error('SCHEDULER:', ...args);
    }
}
