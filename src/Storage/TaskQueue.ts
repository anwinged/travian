import { Args } from '../Common';
import { uniqId } from '../utils';
import { Logger } from '../Logger';

const QUEUE_NAME = 'task_queue:v4';

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

    withTime(ts: number): Task {
        return new Task(this.id, ts, this.name, this.args);
    }
}

export type TaskList = Array<Task>;

export class TaskQueue {
    private readonly logger;

    constructor() {
        this.logger = new Logger(this.constructor.name);
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

    hasNamed(name: string): boolean {
        return this.has(t => t.name === name);
    }

    modify(predicate: (t: Task) => boolean, modifier: (t: Task) => Task) {
        const [matched, other] = this.split(predicate);
        const modified = matched.map(modifier);
        this.flushItems(modified.concat(other));
    }

    complete(id: TaskId) {
        const [_, items] = this.shiftTask(id);
        this.flushItems(items);
    }

    postpone(id: TaskId, newTs: number) {
        const [task, items] = this.shiftTask(id);
        if (task) {
            this.logger.log('POSTPONE', task);
            items.push(task.withTime(newTs));
        }
        this.flushItems(items);
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
        const serialized = localStorage.getItem(QUEUE_NAME);
        const storedItems = serialized !== null ? (JSON.parse(serialized) as Array<{ [key: string]: any }>) : [];
        const items: TaskList = [];
        storedItems.forEach(obj => {
            items.push(new Task(obj.id || uniqId(), +obj.ts, obj.name, obj.args));
        });
        return items;
    }

    private flushItems(items: TaskList): void {
        const normalized = items.sort((x, y) => x.ts - y.ts);
        localStorage.setItem(QUEUE_NAME, JSON.stringify(normalized));
    }
}
