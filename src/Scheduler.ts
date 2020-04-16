import { markPage, sleepMicro, timestamp, waitForLoad } from './utils';
import { UpgradeBuildingTask } from './Task/UpgradeBuildingTask';
import { AbortTaskError, ActionError, BuildingQueueFullError, TryLaterError } from './Errors';
import { Task, TaskId, TaskList, TaskQueue } from './Storage/TaskQueue';
import { ActionQueue } from './Storage/ActionQueue';
import { Args, Command } from './Common';
import { TaskQueueRenderer } from './TaskQueueRenderer';
import { createAction } from './Action/ActionController';
import { createTask } from './Task/TaskController';
import { SendOnAdventureTask } from './Task/SendOnAdventureTask';
import { BalanceHeroResourcesTask } from './Task/BalanceHeroResourcesTask';
import { Logger } from './Logger';
import { BuildBuildingTask } from './Task/BuildBuildingTask';
import { GrabVillageState } from './Task/GrabVillageState';

export class Scheduler {
    private readonly version: string;
    private taskQueue: TaskQueue;
    private actionQueue: ActionQueue;
    private logger: Logger;

    constructor(version: string) {
        this.version = version;
        this.taskQueue = new TaskQueue();
        this.actionQueue = new ActionQueue();
        this.logger = new Logger(this.constructor.name);
    }

    async run() {
        await waitForLoad();
        await sleepMicro();
        markPage('Executor', this.version);

        this.renderTaskQueue();
        setInterval(() => this.renderTaskQueue(), 5 * 1000);

        this.scheduleUniqTask(3600, SendOnAdventureTask.name);
        this.scheduleUniqTask(1200, BalanceHeroResourcesTask.name);
        this.scheduleUniqTask(300, GrabVillageState.name);

        while (true) {
            await this.doTaskProcessingStep();
        }
    }

    private renderTaskQueue() {
        this.logger.log('RENDER TASK QUEUE');
        new TaskQueueRenderer().render(this.taskQueue.seeItems());
    }

    private scheduleUniqTask(seconds: number, name: string, args: Args = {}) {
        const taskScheduler = () => {
            if (!this.taskQueue.hasNamed(name)) {
                this.taskQueue.push(name, args, timestamp() + 5 * 60);
            }
        };
        taskScheduler();
        setInterval(taskScheduler, seconds * 1000);
    }

    private async doTaskProcessingStep() {
        await sleepMicro();
        const currentTs = timestamp();
        const taskCommand = this.taskQueue.get(currentTs);

        // текущего таска нет, очищаем очередь действий по таску
        if (!taskCommand) {
            this.logger.log('NO ACTIVE TASK');
            this.actionQueue.clear();
            return;
        }

        const actionCommand = this.actionQueue.pop();

        this.logger.log('CURRENT TASK', taskCommand);
        this.logger.log('CURRENT ACTION', actionCommand);

        try {
            if (actionCommand) {
                return await this.processActionCommand(actionCommand, taskCommand);
            }

            if (taskCommand) {
                return await this.processTaskCommand(taskCommand);
            }
        } catch (e) {
            this.handleError(e);
        }
    }

    private async processActionCommand(cmd: Command, task: Task) {
        const actionController = createAction(cmd.name, this);
        this.logger.log('PROCESS ACTION', cmd.name, actionController);
        if (actionController) {
            await actionController.run(cmd.args, task);
        } else {
            this.logger.warn('ACTION NOT FOUND', cmd.name);
        }
    }

    private async processTaskCommand(task: Task) {
        const taskController = createTask(task.name, this);
        this.logger.log('PROCESS TASK', task.name, task, taskController);
        if (taskController) {
            await taskController.run(task);
        } else {
            this.logger.warn('TASK NOT FOUND', task.name);
            this.taskQueue.complete(task.id);
        }
    }

    private handleError(err: Error) {
        this.actionQueue.clear();

        if (err instanceof AbortTaskError) {
            this.logger.warn('ABORT TASK', err.taskId);
            this.completeTask(err.taskId);
            return;
        }

        if (err instanceof TryLaterError) {
            this.logger.warn('TRY', err.taskId, 'AFTER', err.seconds);
            this.taskQueue.postpone(err.taskId, timestamp() + err.seconds);
            return;
        }

        if (err instanceof BuildingQueueFullError) {
            this.logger.warn('BUILDING QUEUE FULL, TRY ALL AFTER', err.seconds);
            this.taskQueue.modify(
                t => t.name === BuildBuildingTask.name && t.args.villageId === err.villageId,
                t => t.withTime(timestamp() + err.seconds)
            );
            this.taskQueue.modify(
                t => t.name === UpgradeBuildingTask.name && t.args.villageId === err.villageId,
                t => t.withTime(timestamp() + err.seconds)
            );
            return;
        }

        if (err instanceof ActionError) {
            this.logger.warn('ACTION ABORTED', err.message);
            return;
        }

        this.logger.error(err.message);
        throw err;
    }

    getTaskItems(): TaskList {
        return this.taskQueue.seeItems();
    }

    completeTask(id: TaskId) {
        this.taskQueue.complete(id);
        this.actionQueue.clear();
    }

    scheduleTask(name: string, args: Args): void {
        this.logger.log('PUSH TASK', name, args);
        this.taskQueue.push(name, args, timestamp());
    }

    removeTask(id: TaskId) {
        this.taskQueue.remove(id);
        this.actionQueue.clear();
    }

    scheduleActions(actions: Array<Command>): void {
        this.actionQueue.assign(actions);
    }
}
