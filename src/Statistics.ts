import { StatisticsStorage } from './Storage/StatisticsStorage';
import * as dateFormat from 'dateformat';

export interface ActionStatistics {
    [key: string]: number;
}

export class Statistics {
    private state: StatisticsStorage;

    constructor() {
        this.state = new StatisticsStorage();
    }

    incrementAction(): void {
        const stat = this.state.getActionStatistics();
        const key = dateFormat(Date.now(), 'yyyy-mm-dd-HH');
        stat[key] = (stat[key] || 0) + 1;
        this.state.setActionStatistics(stat);
    }

    getActionStatistics(): ActionStatistics {
        return {};
    }
}
