import { DataStorage } from '../Storage/DataStorage';
import { Task, TaskList, TaskProvider, uniqTaskId } from './TaskProvider';

const QUEUE_NAME = 'queue';

export class DataStorageTaskProvider implements TaskProvider {
    private storage: DataStorage;

    constructor(storage: DataStorage) {
        this.storage = storage;
    }

    static create(namespace: string) {
        return new DataStorageTaskProvider(new DataStorage(namespace));
    }

    getTasks(): TaskList {
        const serialized = this.storage.get(QUEUE_NAME);
        if (!Array.isArray(serialized)) {
            return [];
        }

        const storedItems = serialized as Array<{ [key: string]: any }>;

        return storedItems.map(i => {
            const task = new Task(uniqTaskId(), 0, '', {});
            return Object.assign(task, i);
        });
    }

    setTasks(tasks: TaskList): void {
        this.storage.set(QUEUE_NAME, tasks);
    }
}
