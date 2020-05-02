import { markPage, sleepMicro, timestamp, waitForLoad } from './utils';
import { AbortTaskError, ActionError, TryLaterError } from './Errors';
import { TaskQueueRenderer } from './TaskQueueRenderer';
import { createActionHandler } from './Action/ActionController';
import { createTaskHandler } from './Task/TaskController';
import { ConsoleLogger, Logger } from './Logger';
import { GrabberManager } from './Grabber/GrabberManager';
import { Scheduler } from './Scheduler';
import { Statistics } from './Statistics';
import { ExecutionStorage } from './Storage/ExecutionStorage';
import { Action } from './Queue/ActionQueue';
import { Task } from './Queue/TaskProvider';

export interface ExecutionSettings {
    pauseTs: number;
}

export class Executor {
    private readonly version: string;
    private readonly scheduler: Scheduler;
    private grabbers: GrabberManager;
    private statistics: Statistics;
    private executionState: ExecutionStorage;
    private logger: Logger;

    constructor(version: string, scheduler: Scheduler, statistics: Statistics) {
        this.version = version;
        this.scheduler = scheduler;
        this.grabbers = new GrabberManager();
        this.statistics = statistics;
        this.executionState = new ExecutionStorage();
        this.logger = new ConsoleLogger(this.constructor.name);
    }

    async run() {
        await waitForLoad();
        await sleepMicro();

        this.renderInfo();

        const sleep = createExecutionLoopSleeper();

        while (true) {
            await sleep();
            if (!this.isPaused()) {
                await this.doTaskProcessingStep();
            }
        }
    }

    private renderInfo() {
        try {
            markPage('Executor', this.version);
            this.renderTaskQueue();
        } catch (e) {
            this.logger.warn(e);
        }
    }

    private isPaused(): boolean {
        const { pauseTs } = this.executionState.getExecutionSettings();
        return pauseTs > timestamp();
    }

    private renderTaskQueue() {
        new TaskQueueRenderer().render(this.scheduler.getTaskItems());
    }

    private async doTaskProcessingStep() {
        const currentTs = timestamp();
        const task = this.scheduler.nextTask(currentTs);

        // текущего таска нет, очищаем очередь действий по таску
        if (!task) {
            this.logger.info('NO ACTIVE TASK');
            this.scheduler.clearActions();
            return;
        }

        const actionCommand = this.scheduler.nextAction();

        this.logger.info('CURRENT JOB', 'TASK', task, 'ACTION', actionCommand);

        this.runGrabbers();

        try {
            if (actionCommand) {
                return await this.processActionCommand(actionCommand, task);
            }

            if (task) {
                return await this.processTaskCommand(task);
            }
        } catch (e) {
            this.handleError(e, task);
        }
    }

    private async processActionCommand(cmd: Action, task: Task) {
        const actionHandler = createActionHandler(cmd.name, this.scheduler);
        this.logger.info('PROCESS ACTION', cmd.name, actionHandler);
        if (cmd.args.taskId !== task.id) {
            throw new ActionError(`Action task id ${cmd.args.taskId} not equal current task id ${task.id}`);
        }
        if (actionHandler) {
            this.statistics.incrementAction(timestamp());
            await actionHandler.run(cmd.args, task);
        } else {
            this.logger.warn('ACTION NOT FOUND', cmd.name);
        }
    }

    private async processTaskCommand(task: Task) {
        const taskHandler = createTaskHandler(task.name, this.scheduler);
        this.logger.info('PROCESS TASK', task.name, task, taskHandler);
        if (taskHandler) {
            await taskHandler.run(task);
        } else {
            this.logger.warn('TASK NOT FOUND', task.name);
            this.scheduler.removeTask(task.id);
        }
    }

    private handleError(err: Error, task: Task) {
        this.scheduler.clearActions();

        if (err instanceof AbortTaskError) {
            this.logger.warn('ABORT TASK', task.id);
            this.scheduler.removeTask(task.id);
            return;
        }

        if (err instanceof TryLaterError) {
            this.logger.warn('TRY', task.id, 'AFTER', err.seconds);
            this.scheduler.postponeTask(task.id, err.seconds);
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
            this.logger.info('Rug grabbers');
            this.grabbers.grab();
        } catch (e) {
            this.logger.warn('Grabbers fails with', e.message);
        }
    }
}

function createExecutionLoopSleeper() {
    let skipFirstSleep = true;
    return async () => {
        if (skipFirstSleep) {
            skipFirstSleep = false;
        } else {
            await sleepMicro();
        }
    };
}
