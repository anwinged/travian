import { DataStorage } from './DataStorage';
import { ResourceTransferReport } from '../Village/ResourceTransfer';

const NAMESPACE = 'resource_transfer.v1';

const REPORT_KEY = 'report';

export class ResourceTransferStorage {
    private storage: DataStorage;
    constructor() {
        this.storage = new DataStorage(NAMESPACE);
    }

    storeReport(report: ResourceTransferReport): void {
        this.storage.set(REPORT_KEY, report);
    }

    getReport(): ResourceTransferReport {
        return this.storage.getTyped<ResourceTransferReport>(REPORT_KEY, {
            factory: () => ({
                fromVillageId: 0,
                toVillageId: 0,
                resources: {
                    lumber: 0,
                    clay: 0,
                    iron: 0,
                    crop: 0,
                },
                score: {
                    amount: 0,
                    overflow: false,
                },
            }),
        });
    }
}
