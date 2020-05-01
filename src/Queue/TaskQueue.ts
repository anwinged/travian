import { Logger } from '../Logger';
import { Args } from './Args';
import { ImmutableTaskList, Task, TaskId, TaskList, TaskProvider, uniqTaskId } from './TaskProvider';

export class TaskQueue {
    private provider: TaskProvider;
    private readonly logger: Logger;

    constructor(provider: TaskProvider, logger: Logger) {
        this.provider = provider;
        this.logger = logger;
    }

    push(name: string, args: Args, ts: number): Task {
        const id = uniqTaskId();
        const task = new Task(id, ts, name, args);
        this.logger.info('PUSH TASK', id, ts, name, args);
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

    seeItems(): ImmutableTaskList {
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
        return this.provider.getTasks();
    }

    private flushItems(items: TaskList): void {
        items.sort((x, y) => x.ts - y.ts || x.id.localeCompare(y.id));
        this.provider.setTasks(items);
    }
}
