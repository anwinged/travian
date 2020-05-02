import * as dateFormat from 'dateformat';

const KEY_FORMAT = 'yyyy-mm-dd-HH';
const KEEP_RECORD_COUNT = 24;

export interface ActionStatistics {
    [key: string]: number;
}

export interface StatisticsStorageInterface {
    getActionStatistics(): ActionStatistics;
    setActionStatistics(statistics: ActionStatistics): void;
}

export class Statistics {
    private state: StatisticsStorageInterface;

    static readonly keepRecords = KEEP_RECORD_COUNT;

    constructor(storage: StatisticsStorageInterface) {
        this.state = storage;
    }

    incrementAction(ts: number): void {
        const stat = this.state.getActionStatistics();
        const key = dateFormat(ts * 1000, KEY_FORMAT);
        stat[key] = (stat[key] || 0) + 1;
        this.trimStatistics(stat);
        this.state.setActionStatistics(stat);
    }

    private trimStatistics(stat: ActionStatistics) {
        const topKeys = this.getTopStatKeys(stat);
        const statKeys = Object.keys(stat);
        for (let key of statKeys) {
            if (!topKeys.includes(key)) {
                delete stat[key];
            }
        }
        return stat;
    }

    private getTopStatKeys(stat: ActionStatistics) {
        const keys = Object.keys(stat);
        return keys
            .sort()
            .reverse()
            .slice(0, KEEP_RECORD_COUNT);
    }

    getActionStatistics(): ActionStatistics {
        return this.state.getActionStatistics();
    }
}
