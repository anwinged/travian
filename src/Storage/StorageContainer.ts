import { LogStorage } from './LogStorage';
import { DataStorage } from './DataStorage';
import { StatisticsStorage } from './StatisticsStorage';

export class StorageContainer {
    private _logStorage: LogStorage | undefined;

    get logStorage(): LogStorage {
        this._logStorage = this._logStorage || new LogStorage(new DataStorage('logs.v1'));
        return this._logStorage;
    }

    private _statisticsStorage: StatisticsStorage | undefined;

    get statisticsStorage(): StatisticsStorage {
        this._statisticsStorage =
            this._statisticsStorage || new StatisticsStorage(new DataStorage('statistics.v1'));
        return this._statisticsStorage;
    }
}
