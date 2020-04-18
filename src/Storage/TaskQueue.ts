import { Args } from '../Common';
import { uniqId } from '../utils';
import { ConsoleLogger, Logger } from '../Logger';
import { DataStorage } from './DataStorage';

const NAMESPACE = 'tasks:v1';
const QUEUE_NAME = 'queue';

export type TaskId = string;

function uniqTaskId(): TaskId {
    return uniqId();
}

export class Task {
    readonly id: TaskId;
    readonly ts: number;
    readonly name: string;
    readonly args: Args;
    constructor(id: TaskId, ts: number, name: string, args: Args) {
        this.id = id;
        this.ts = ts;
        this.name = name;
        this.args = args;
    }
}

export type TaskList = Array<Task>;

export class TaskQueue {
    private readonly logger: Logger;
    private storage: DataStorage;

    constructor() {
        this.storage = new DataStorage(NAMESPACE);
        this.logger = new ConsoleLogger(this.constructor.name);
    }

    push(name: string, args: Args, ts: number): Task {
        const id = uniqTaskId();
        const task = new Task(id, ts, name, args);
        this.logger.log('PUSH TASK', id, ts, name, args);
        let items = this.getItems();
        items.push(task);
        this.flushItems(items);
        return task;
    }

    get(ts: number): Task | undefined {
        const readyItems = this.getItems().filter(t => t.ts <= ts);
        if (readyItems.length === 0) {
            return undefined;
        }
        return readyItems[0];
    }

    has(predicate: (t: Task) => boolean): boolean {
        const [matched, _] = this.split(predicate);
        return matched.length > 0;
    }

    modify(predicate: (t: Task) => boolean, modifier: (t: Task) => Task) {
        const [matched, other] = this.split(predicate);
        const modified = matched.map(modifier);
        this.flushItems(modified.concat(other));
    }

    remove(id: TaskId) {
        const [_, items] = this.shiftTask(id);
        this.flushItems(items);
    }

    seeItems(): TaskList {
        return this.getItems();
    }

    private shiftTask(id: TaskId): [Task | undefined, TaskList] {
        const [a, b] = this.split(t => t.id === id);
        return [a.shift(), b];
    }

    private split(predicate: (t: Task) => boolean): [TaskList, TaskList] {
        const matched: TaskList = [];
        const other: TaskList = [];
        this.getItems().forEach(t => {
            if (predicate(t)) {
                matched.push(t);
            } else {
                other.push(t);
            }
        });
        return [matched, other];
    }

    private getItems(): TaskList {
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

    private flushItems(items: TaskList): void {
        const normalized = items.sort((x, y) => x.ts - y.ts);
        this.storage.set(QUEUE_NAME, normalized);
    }
}
