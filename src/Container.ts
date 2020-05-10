import { Scheduler } from './Scheduler';
import { TaskQueue } from './Queue/TaskQueue';
import { ConsoleLogger } from './Logger';
import { ActionQueue } from './Queue/ActionQueue';
import { Executor } from './Executor';
import { ControlPanel } from './ControlPanel';
import { DataStorageTaskProvider } from './Queue/DataStorageTaskProvider';
import { Statistics } from './Statistics';
import { StatisticsStorage } from './Storage/StatisticsStorage';
import { VillageRepository, VillageRepositoryInterface } from './VillageRepository';
import { VillageStateRepository } from './VillageState';

export class Container {
    private readonly version: string;

    constructor(version: string) {
        this.version = version;
    }

    private _villageRepository: VillageRepository | undefined;

    get villageRepository(): VillageRepository {
        this._villageRepository =
            this._villageRepository ||
            (() => {
                return new VillageRepository();
            })();
        return this._villageRepository;
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

    private _scheduler: Scheduler | undefined;

    get scheduler(): Scheduler {
        this._scheduler =
            this._scheduler ||
            (() => {
                const taskProvider = DataStorageTaskProvider.create();
                const taskQueue = new TaskQueue(taskProvider, new ConsoleLogger(TaskQueue.name));
                const actionQueue = new ActionQueue();
                return new Scheduler(taskQueue, actionQueue, this.villageRepository, new ConsoleLogger(Scheduler.name));
            })();
        return this._scheduler;
    }

    private _villageStateRepository: VillageStateRepository | undefined;

    get villageStateRepository(): VillageStateRepository {
        this._villageStateRepository =
            this._villageStateRepository ||
            (() => {
                return new VillageStateRepository(this.villageRepository, this.scheduler);
            })();
        return this._villageStateRepository;
    }

    private _executor: Executor | undefined;

    get executor(): Executor {
        this._executor =
            this._executor ||
            (() => {
                return new Executor(this.version, this.scheduler, this.villageStateRepository, this.statistics);
            })();
        return this._executor;
    }

    private _controlPanel: ControlPanel | undefined;

    get controlPanel(): ControlPanel {
        this._controlPanel =
            this._controlPanel ||
            (() => {
                return new ControlPanel(this.version, this.scheduler, this.villageStateRepository);
            })();
        return this._controlPanel;
    }
}
