import { StatisticsState } from './State/StatisticsState';
import * as dateFormat from 'dateformat';

export interface ActionStatistics {
    [key: string]: number;
}

export class Statistics {
    private state: StatisticsState;

    constructor() {
        this.state = new StatisticsState();
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
