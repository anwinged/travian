import { it, describe } from 'mocha';
import { expect } from 'chai';

import { ActionStatistics, Statistics, StatisticsStorageInterface } from '../../src/Statistics';

class MemoryStatisticsStorage implements StatisticsStorageInterface {
    stat: ActionStatistics = {};

    getActionStatistics(): ActionStatistics {
        return this.stat;
    }

    setActionStatistics(statistics: ActionStatistics): void {
        this.stat = statistics;
    }
}

describe('Statistics', function () {
    it('Can save statistics item', function () {
        const storage = new MemoryStatisticsStorage();
        const statistics = new Statistics(storage);
        statistics.incrementAction(1588408294);
        expect(Object.keys(statistics.getActionStatistics())).to.has.lengthOf(1);
    });

    it('Can trim statistics', function () {
        const storage = new MemoryStatisticsStorage();
        const statistics = new Statistics(storage);
        const baseTime = 1588408294;
        for (let i = 0; i < 120; ++i) {
            statistics.incrementAction(baseTime + 3600 * i);
        }
        expect(Object.keys(statistics.getActionStatistics())).to.has.lengthOf(
            Statistics.keepRecords
        );
    });
});
