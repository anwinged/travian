import { DataStorage } from './DataStorage';
import { LogStorageInterface, StorageLogRecord } from '../Logger';

const RECORD_LIST_KEY = 'records';
const RECORD_COUNT = 200;

export class LogStorage implements LogStorageInterface {
    private readonly storage: DataStorage;

    constructor(storage: DataStorage) {
        this.storage = storage;
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
