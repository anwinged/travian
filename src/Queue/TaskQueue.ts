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

    add(task: Task) {
        let items = this.getItems();
        items.push(task);
        this.flushItems(items);
    }

    get(ts: number): Task | undefined {
        const readyItems = this.getItems().filter(t => t.ts <= ts);
        if (readyItems.length === 0) {
            return undefined;
        }
        return readyItems[0];
    }

    findById(taskId: TaskId): Task | undefined {
        const [matched, _] = this.split(t => t.id === taskId);
        return matched.shift();
    }

    has(predicate: (t: Task) => boolean): boolean {
        const [matched, _] = this.split(predicate);
        return matched.length > 0;
    }

    modify(predicate: (t: Task) => boolean, modifier: (t: Task) => Task): number {
        const [matched, other] = this.split(predicate);
        const modified = matched.map(modifier);
        const modifiedCount = modified.length;
        this.flushItems(modified.concat(other));
        return modifiedCount;
    }

    remove(predicate: (t: Task) => boolean): number {
        const [_, other] = this.split(predicate);
        const result = other.length;
        this.flushItems(other);
        return result;
    }

    seeItems(): ImmutableTaskList {
        return this.getItems();
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
