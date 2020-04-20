import { markPage, sleepMicro, timestamp, waitForLoad } from './utils';
import { AbortTaskError, ActionError, TryLaterError } from './Errors';
import { Task } from './Queue/TaskQueue';
import { Command } from './Command';
import { TaskQueueRenderer } from './TaskQueueRenderer';
import { createAction } from './Action/ActionController';
import { createTask } from './Task/TaskController';
import { ConsoleLogger, Logger } from './Logger';
import { StateGrabberManager } from './Grabber/StateGrabberManager';
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
        new TaskQueueRenderer().render(this.scheduler.getTaskItems());
    }

    private async doTaskProcessingStep() {
        await sleepMicro();

        const currentTs = timestamp();
        const task = this.scheduler.nextTask(currentTs);

        // текущего таска нет, очищаем очередь действий по таску
        if (!task) {
            this.logger.log('NO ACTIVE TASK');
            this.scheduler.clearActions();
            return;
        }

        const actionCommand = this.scheduler.nextAction();

        this.logger.log('CURRENT JOB', 'TASK', task, 'ACTION', actionCommand);

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

    private async processActionCommand(cmd: Command, task: Task) {
        const actionController = createAction(cmd.name, this.scheduler);
        this.logger.log('PROCESS ACTION', cmd.name, actionController);
        if (cmd.args.taskId !== task.id) {
            throw new ActionError(`Action task id ${cmd.args.taskId} not equal current task id ${task.id}`);
        }
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

    private handleError(err: Error, task: Task) {
        this.scheduler.clearActions();

        if (err instanceof AbortTaskError) {
            this.logger.warn('ABORT TASK', task.id);
            this.scheduler.completeTask(task.id);
            this.scheduler.clearActions();
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
            this.logger.log('Rug grabbers');
            this.grabbers.grab();
        } catch (e) {
            this.logger.warn('Grabbers fails with', e.message);
        }
    }
}
