import { DataStorage } from '../DataStorage';
import { uniqId } from '../utils';
import { Task, TaskList, TaskProvider } from './TaskProvider';

const NAMESPACE = 'tasks:v1';
const QUEUE_NAME = 'queue';

export class DataStorageTaskProvider implements TaskProvider {
    private storage: DataStorage;

    constructor(storage: DataStorage) {
        this.storage = storage;
    }

    static create() {
        return new DataStorageTaskProvider(new DataStorage(NAMESPACE));
    }

    getTasks(): TaskList {
        const serialized = this.storage.get(QUEUE_NAME);
        if (!Array.isArray(serialized)) {
            return [];
        }

        const storedItems = serialized as Array<{ [key: string]: any }>;

        return storedItems.map(i => {
            const task = new Task(uniqId(), 0, '', {});
            return Object.assign(task, i);
        });
    }

    setTasks(tasks: TaskList): void {
        this.storage.set(QUEUE_NAME, tasks);
    }
}
