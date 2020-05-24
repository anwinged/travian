import { Scheduler } from './Scheduler';
import { TaskQueue } from './Queue/TaskQueue';
import { AggregateLogger, ConsoleLogger, LogLevel, StorageLogger } from './Logger';
import { ActionQueue } from './Queue/ActionQueue';
import { Executor } from './Executor';
import { ControlPanel } from './ControlPanel';
import { DataStorageTaskProvider } from './Queue/DataStorageTaskProvider';
import { Statistics } from './Statistics';
import { StatisticsStorage } from './Storage/StatisticsStorage';
import { VillageRepository } from './VillageRepository';
import { VillageStateRepository } from './VillageState';
import { LogStorage } from './Storage/LogStorage';
import { VillageControllerFactory } from './VillageControllerFactory';
import { GrabberManager } from './Grabber/GrabberManager';

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

    private _villageControllerFactory: VillageControllerFactory | undefined;

    get villageControllerFactory(): VillageControllerFactory {
        this._villageControllerFactory =
            this._villageControllerFactory ||
            (() => {
                return new VillageControllerFactory(this.villageRepository);
            })();
        return this._villageControllerFactory;
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
                    this.villageControllerFactory,
                    new ConsoleLogger(Scheduler.name)
                );
            })();
        return this._scheduler;
    }

    private _villageStateRepository: VillageStateRepository | undefined;

    get villageStateRepository(): VillageStateRepository {
        this._villageStateRepository =
            this._villageStateRepository ||
            (() => {
                return new VillageStateRepository(this.villageRepository, this.villageControllerFactory);
            })();
        return this._villageStateRepository;
    }

    private _grabberManager: GrabberManager | undefined;

    get grabberManager(): GrabberManager {
        this._grabberManager =
            this._grabberManager ||
            (() => {
                return new GrabberManager(this.villageControllerFactory);
            })();
        return this._grabberManager;
    }

    private _executor: Executor | undefined;

    get executor(): Executor {
        this._executor =
            this._executor ||
            (() => {
                const logger = new AggregateLogger([
                    new ConsoleLogger(Executor.name),
                    new StorageLogger(new LogStorage(), LogLevel.warning),
                ]);
                return new Executor(
                    this.version,
                    this.scheduler,
                    this.villageStateRepository,
                    this.villageControllerFactory,
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
                return new ControlPanel(
                    this.version,
                    this.scheduler,
                    this.villageStateRepository,
                    this.villageControllerFactory
                );
            })();
        return this._controlPanel;
    }
}
