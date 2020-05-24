import { DataStorage } from '../DataStorage';
import { LogStorageInterface, StorageLogRecord } from '../Logger';

const NAMESPACE = 'logs.v1';
const RECORD_LIST_KEY = 'records';

const RECORD_COUNT = 200;

export class LogStorage implements LogStorageInterface {
    private storage: DataStorage;
    constructor() {
        this.storage = new DataStorage(NAMESPACE);
    }

    write(record: StorageLogRecord): void {
        const records = this.getRecords();
        records.push(record);
        this.setRecords(records.slice(-RECORD_COUNT));
    }

    getRecords(): Array<StorageLogRecord> {
        return this.storage.getTypedList<StorageLogRecord>(RECORD_LIST_KEY, {
            factory: () => ({ level: '', message: '', ts: 0 }),
        });
    }

    setRecords(records: Array<StorageLogRecord>): void {
        this.storage.set(RECORD_LIST_KEY, records);
    }
}
