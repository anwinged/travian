import { DataStorage } from './DataStorage';
import { ActionStatistics, StatisticsStorageInterface } from '../Statistics';

const ACTION_STATISTICS_KEY = 'actions';

export class StatisticsStorage implements StatisticsStorageInterface {
    private storage: DataStorage;

    constructor(storage: DataStorage) {
        this.storage = storage;
    }

    getActionStatistics(): ActionStatistics {
        return this.storage.getTyped<ActionStatistics>(ACTION_STATISTICS_KEY, {
            factory: () => ({}),
        });
    }

    setActionStatistics(statistics: ActionStatistics): void {
        this.storage.set(ACTION_STATISTICS_KEY, statistics);
    }
}
