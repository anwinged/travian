import { markPage, sleepMicro, timestamp, waitForLoad } from './utils';
import { AbortTaskError, ActionError, BuildingQueueFullError, TryLaterError } from './Errors';
import { Task } from './Storage/TaskQueue';
import { Command } from './Common';
import { TaskQueueRenderer } from './TaskQueueRenderer';
import { createAction } from './Action/ActionController';
import { createTask } from './Task/TaskController';
import { ConsoleLogger, Logger } from './Logger';
import { StateGrabberManager } from './State/StateGrabberManager';
import { Scheduler } from './Scheduler';

export class Executor {
    private readonly version: string;
    private readonly scheduler: Scheduler;
    private grabbers: StateGrabberManager;
    private logger: Logger;

    constructor(version: string, scheduler: Scheduler) {
        this.version = version;
        this.scheduler = scheduler;
        this.grabbers = new StateGrabberManager();
        this.logger = new ConsoleLogger(this.constructor.name);
    }

    async run() {
        await waitForLoad();
        await sleepMicro();
        markPage('Executor', this.version);

        this.renderTaskQueue();
        setInterval(() => this.renderTaskQueue(), 5 * 1000);

        while (true) {
            await this.doTaskProcessingStep();
        }
    }

    private renderTaskQueue() {
        this.logger.log('RENDER TASK QUEUE');
        new TaskQueueRenderer().render(this.scheduler.getTaskItems());
    }

    private async doTaskProcessingStep() {
        await sleepMicro();
        const currentTs = timestamp();
        const taskCommand = this.scheduler.nextTask(currentTs);

        // текущего таска нет, очищаем очередь действий по таску
        if (!taskCommand) {
            this.logger.log('NO ACTIVE TASK');
            this.scheduler.clearActions();
            return;
        }

        const actionCommand = this.scheduler.nextAction();

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
        this.runGrabbers();
        const actionController = createAction(cmd.name, this.scheduler);
        this.logger.log('PROCESS ACTION', cmd.name, actionController);
        if (actionController) {
            await actionController.run(cmd.args, task);
        } else {
            this.logger.warn('ACTION NOT FOUND', cmd.name);
        }
    }

    private async processTaskCommand(task: Task) {
        const taskController = createTask(task.name, this.scheduler);
        this.logger.log('PROCESS TASK', task.name, task, taskController);
        if (taskController) {
            await taskController.run(task);
        } else {
            this.logger.warn('TASK NOT FOUND', task.name);
            this.scheduler.completeTask(task.id);
        }
    }

    private handleError(err: Error) {
        this.scheduler.clearActions();

        if (err instanceof AbortTaskError) {
            this.logger.warn('ABORT TASK', err.taskId);
            this.scheduler.completeTask(err.taskId);
            this.scheduler.clearActions();
            return;
        }

        if (err instanceof TryLaterError) {
            this.logger.warn('TRY', err.taskId, 'AFTER', err.seconds);
            this.scheduler.postponeTask(err.taskId, err.seconds);
            return;
        }

        if (err instanceof BuildingQueueFullError) {
            this.logger.warn('BUILDING QUEUE FULL, TRY ALL AFTER', err.seconds);
            this.scheduler.postponeBuildingsInVillage(err.villageId, err.seconds);
            return;
        }

        if (err instanceof ActionError) {
            this.logger.warn('ACTION ABORTED', err.message);
            return;
        }

        this.logger.error(err.message);
        throw err;
    }

    private runGrabbers() {
        try {
            this.logger.log('Rug grabbers');
            this.grabbers.grab();
        } catch (e) {
            this.logger.warn('Grabbers fails with', e.message);
        }
    }
}
