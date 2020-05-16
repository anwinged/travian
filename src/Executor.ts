import { markPage, sleepMicro, timestamp, waitForLoad } from './utils';
import { AbortTaskError, ActionError, GrabError, TryLaterError, VillageNotFound } from './Errors';
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
import { VillageStateRepository } from './VillageState';

export interface ExecutionSettings {
    pauseTs: number;
}

export class Executor {
    private readonly version: string;
    private readonly scheduler: Scheduler;
    private readonly villageStateRepository: VillageStateRepository;
    private grabbers: GrabberManager;
    private statistics: Statistics;
    private executionState: ExecutionStorage;
    private logger: Logger;

    constructor(
        version: string,
        scheduler: Scheduler,
        villageStateRepository: VillageStateRepository,
        statistics: Statistics,
        logger: Logger
    ) {
        this.version = version;
        this.scheduler = scheduler;
        this.villageStateRepository = villageStateRepository;
        this.grabbers = new GrabberManager(scheduler);
        this.statistics = statistics;
        this.executionState = new ExecutionStorage();
        this.logger = logger;
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
        const actionHandler = createActionHandler(cmd.name, this.scheduler, this.villageStateRepository);
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
            this.logger.warn('Abort task', task.id, 'MSG', err.message);
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

        if (err instanceof GrabError) {
            this.logger.error('Layout element not found, abort action', err.message);
            return;
        }

        if (err instanceof ActionError) {
            this.logger.error('Abort action', err.message);
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
