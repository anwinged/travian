import { Scheduler } from './Scheduler';
import { TaskQueue } from './Queue/TaskQueue';
import { ConsoleLogger } from './Logger';
import { ActionQueue } from './Queue/ActionQueue';
import { Executor } from './Executor';
import { ControlPanel } from './ControlPanel';
import { DataStorageTaskProvider } from './Queue/DataStorageTaskProvider';
import { Statistics } from './Statistics';
import { StatisticsStorage } from './Storage/StatisticsStorage';

export class Container {
    private readonly version: string;

    constructor(version: string) {
        this.version = version;
    }

    private _scheduler: Scheduler | undefined;

    get scheduler(): Scheduler {
        this._scheduler =
            this._scheduler ||
            (() => {
                const taskProvider = DataStorageTaskProvider.create();
                const taskQueue = new TaskQueue(taskProvider, new ConsoleLogger(TaskQueue.name));
                const actionQueue = new ActionQueue();
                return new Scheduler(taskQueue, actionQueue, new ConsoleLogger(Scheduler.name));
            })();
        return this._scheduler;
    }

    private _executor: Executor | undefined;

    get executor(): Executor {
        this._executor =
            this._executor ||
            (() => {
                return new Executor(this.version, this.scheduler, this.statistics);
            })();
        return this._executor;
    }

    private _controlPanel: ControlPanel | undefined;

    get controlPanel(): ControlPanel {
        this._controlPanel =
            this._controlPanel ||
            (() => {
                return new ControlPanel(this.version, this.scheduler);
            })();
        return this._controlPanel;
    }

    private _statistics: Statistics | undefined;

    get statistics(): Statistics {
        this._statistics =
            this._statistics ||
            (() => {
                return new Statistics(new StatisticsStorage());
            })();
        return this._statistics;
    }
}
