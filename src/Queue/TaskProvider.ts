import { Args } from './Args';
import { uniqId } from '../utils';

export type TaskId = string;

let idSequence = 1;
let lastTimestamp: number | null = null;

export function uniqTaskId(): TaskId {
    const ts = Math.floor(Date.now() / 1000);
    if (ts === lastTimestamp) {
        ++idSequence;
    } else {
        idSequence = 1;
    }
    lastTimestamp = ts;
    return 'tid.' + ts + '.' + String(idSequence).padStart(4, '0') + '.' + uniqId('');
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
export type ImmutableTaskList = ReadonlyArray<Task>;

export interface TaskProvider {
    getTasks(): TaskList;

    setTasks(tasks: TaskList): void;
}
