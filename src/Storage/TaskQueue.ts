import { Command } from '../Common';
import { uniqId } from '../utils';

const QUEUE_NAME = 'task_queue:v3';

export type TaskId = string;

function uniqTaskId(): TaskId {
    return uniqId();
}

export class Task {
    readonly id: TaskId;
    readonly ts: number;
    readonly cmd: Command;
    constructor(id: TaskId, ts: number, cmd: Command) {
        this.id = id;
        this.ts = ts;
        this.cmd = cmd;
    }

    withTime(ts: number): Task {
        return new Task(this.id, ts, this.cmd);
    }
}

export type TaskList = Array<Task>;

export class TaskQueue {
    private static normalize(items: TaskList): TaskList {
        return items.sort((x, y) => x.ts - y.ts);
    }

    push(cmd: Command, ts: number): Task {
        const id = uniqTaskId();
        const task = new Task(id, ts, cmd);
        this.log('PUSH TASK', id, ts, cmd);
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

    complete(id: TaskId) {
        const [_, items] = this.shiftTask(id);
        this.flushItems(items);
    }

    postpone(id: TaskId, newTs: number) {
        const [task, items] = this.shiftTask(id);
        if (task) {
            this.log('POSTPONE', task);
            items.push(task.withTime(newTs));
        }
        this.flushItems(items);
    }

    seeItems(): TaskList {
        return this.getItems();
    }

    private shiftTask(id: TaskId): [Task | undefined, TaskList] {
        const items = this.getItems();
        const task = items.find(t => t.id === id);
        const tail = items.filter(t => t.id !== id);
        return [task, tail];
    }

    private getItems(): TaskList {
        const serialized = localStorage.getItem(QUEUE_NAME);
        const storedItems =
            serialized !== null
                ? (JSON.parse(serialized) as Array<{ [key: string]: any }>)
                : [];
        const items: TaskList = [];
        storedItems.forEach(obj => {
            items.push(new Task(obj.id || uniqId(), +obj.ts, obj.cmd));
        });
        return items;
    }

    private flushItems(items: TaskList): void {
        localStorage.setItem(
            QUEUE_NAME,
            JSON.stringify(TaskQueue.normalize(items))
        );
    }

    private log(...args) {
        console.log('TASK QUEUE:', ...args);
    }
}
