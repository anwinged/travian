import { DataStorage } from '../DataStorage';
import { ActionStatistics } from '../Statistics';

const NAMESPACE = 'statistics.v1';

const ACTION_STATISTICS_KEY = 'actions';

export class StatisticsState {
    private storage: DataStorage;
    constructor() {
        this.storage = new DataStorage(NAMESPACE);
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