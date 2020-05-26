import { markPage, sleepMicro, timestamp, waitForLoad } from './utils';
import {
    AbortTaskError,
    ActionError,
    FailTaskError,
    GrabError,
    TryLaterError,
    VillageNotFound,
} from './Errors';
import { TaskQueueRenderer } from './TaskQueueRenderer';
import { createActionHandler } from './Action/ActionController';
import { Logger } from './Logger';
import { GrabberManager } from './Grabber/GrabberManager';
import { Scheduler } from './Scheduler';
import { Statistics } from './Statistics';
import { ExecutionStorage } from './Storage/ExecutionStorage';
import { Action } from './Queue/ActionQueue';
import { Task } from './Queue/TaskProvider';
import { createTaskHandler } from './Task/TaskMap';
import { VillageFactory } from './VillageFactory';

export interface ExecutionSettings {
    pauseTs: number;
}

export class Executor {
    private readonly version: string;
    private readonly scheduler: Scheduler;
    private villageFactory: VillageFactory;
    private grabberManager: GrabberManager;
    private statistics: Statistics;
    private executionState: ExecutionStorage;
    private logger: Logger;

    constructor(
        version: string,
        scheduler: Scheduler,
        villageFactory: VillageFactory,
        grabberManager: GrabberManager,
        statistics: Statistics,
        logger: Logger
    ) {
        this.version = version;
        this.scheduler = scheduler;
        this.villageFactory = villageFactory;
        this.grabberManager = grabberManager;
        this.statistics = statistics;
        this.executionState = new ExecutionStorage();
        this.logger = logger;
    }

    async run() {
        await waitForLoad();
        await sleepMicro();

        this.renderInfo();

        const sleep = createExecutionLoopSleeper();

        // noinspection InfiniteLoopJS
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
        const { task, action } = this.scheduler.nextTask(currentTs);

        // текущего таска нет, очищаем очередь действий по таску
        if (!task) {
            this.logger.info('NO ACTIVE TASK');
            return;
        }

        this.logger.info('CURRENT JOB', 'TASK', task, 'ACTION', action);

        this.runGrabbers();

        try {
            if (task && action) {
                return await this.processActionCommand(action, task);
            }

            if (task) {
                return await this.processTaskCommand(task);
            }
        } catch (e) {
            this.handleError(e, task);
        }
    }

    private async processActionCommand(action: Action, task: Task) {
        const actionHandler = createActionHandler(action.name, this.scheduler, this.villageFactory);
        this.logger.info('Process action', action.name, actionHandler);
        if (actionHandler) {
            this.statistics.incrementAction(timestamp());
            await actionHandler.run(action.args, task);
        } else {
            this.logger.error('Action not found', action.name);
        }
    }

    private async processTaskCommand(task: Task) {
        const taskHandler = createTaskHandler(task.name, this.scheduler, this.villageFactory);
        this.logger.info('Process task', task.name, task, taskHandler);
        if (taskHandler) {
            await taskHandler.run(task);
        } else {
            this.logger.error('Task handler not created', task.name);
            this.scheduler.removeTask(task.id);
        }
    }

    private handleError(err: Error, task: Task) {
        this.scheduler.clearActions();

        if (err instanceof AbortTaskError) {
            this.logger.warn('Abort task', task.id, 'msg', err.message);
            this.scheduler.removeTask(task.id);
            return;
        }

        if (err instanceof VillageNotFound) {
            this.logger.error('Village not found, abort task', task.id, 'msg', err.message);
            this.scheduler.removeTask(task.id);
            return;
        }

        if (err instanceof TryLaterError) {
            this.logger.warn('Try', task.id, 'after', err.seconds, 'msg', err.message);
            this.scheduler.postponeTask(task.id, err.seconds);
            return;
        }

        if (err instanceof FailTaskError) {
            this.logger.error('Fail task', task.id, 'msg', err.message);
            this.scheduler.removeTask(task.id);
            return;
        }

        if (err instanceof GrabError) {
            this.logger.error('Layout element not found, abort action', err.message);
            return;
        }

        if (err instanceof ActionError) {
            this.logger.error('Action error', err.message);
            return;
        }

        this.logger.error(err.message);
        throw err;
    }

    private runGrabbers() {
        try {
            this.logger.info('Rug grabbers');
            this.grabberManager.grab();
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
