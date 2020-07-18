import { Scheduler } from './Scheduler';
import { TaskQueue } from './Queue/TaskQueue';
import { AggregateLogger, ConsoleLogger, LogLevel, StorageLogger } from './Logger';
import { ActionQueue } from './Queue/ActionQueue';
import { Executor } from './Executor';
import { ControlPanel } from './ControlPanel';
import { DataStorageTaskProvider } from './Queue/TaskProvider/DataStorageTaskProvider';
import { Statistics } from './Statistics';
import { VillageRepository } from './Village/VillageRepository';
import { VillageFactory } from './Village/VillageFactory';
import { GrabberManager } from './Grabber/GrabberManager';
import { StorageContainer } from './Storage/StorageContainer';

export class Container {
    private readonly version: string;

    constructor(version: string) {
        this.version = version;
    }

    private _storageContainer: StorageContainer | undefined;

    get storageContainer(): StorageContainer {
        this._storageContainer = this._storageContainer || (() => new StorageContainer())();
        return this._storageContainer;
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
                return new Statistics(this.storageContainer.statisticsStorage);
            })();
        return this._statistics;
    }

    private _villageFactory: VillageFactory | undefined;

    get villageFactory(): VillageFactory {
        this._villageFactory =
            this._villageFactory ||
            (() => {
                return new VillageFactory(this.villageRepository);
            })();
        return this._villageFactory;
    }

    private _scheduler: Scheduler | undefined;

    get scheduler(): Scheduler {
        this._scheduler =
            this._scheduler ||
            (() => {
                const taskQueue = new TaskQueue(
                    DataStorageTaskProvider.create('tasks:v1'),
                    new ConsoleLogger(TaskQueue.name)
                );
                const actionQueue = new ActionQueue();
                return new Scheduler(
                    taskQueue,
                    actionQueue,
                    this.villageRepository,
                    this.villageFactory,
                    new ConsoleLogger(Scheduler.name)
                );
            })();
        return this._scheduler;
    }

    private _grabberManager: GrabberManager | undefined;

    get grabberManager(): GrabberManager {
        this._grabberManager =
            this._grabberManager ||
            (() => {
                return new GrabberManager(this.villageFactory);
            })();
        return this._grabberManager;
    }

    private _executor: Executor | undefined;

    get executor(): Executor {
        this._executor =
            this._executor ||
            (() => {
                const consoleLogger = new ConsoleLogger(Executor.name);
                const storageLogger = new StorageLogger(
                    this.storageContainer.logStorage,
                    LogLevel.warning
                );
                const logger = new AggregateLogger([consoleLogger, storageLogger]);
                return new Executor(
                    this.version,
                    this.scheduler,
                    this.villageFactory,
                    this.grabberManager,
                    this.statistics,
                    logger
                );
            })();
        return this._executor;
    }

    private _controlPanel: ControlPanel | undefined;

    get controlPanel(): ControlPanel {
        this._controlPanel =
            this._controlPanel ||
            (() => {
                return new ControlPanel(this.version, this.scheduler, this.villageFactory);
            })();
        return this._controlPanel;
    }
}
