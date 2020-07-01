import { Args } from './Args';
import { uniqId } from '../utils';
import { ResourcesInterface } from '../Core/Resources';
import { ProductionQueue } from '../Core/ProductionQueue';
import { getProductionQueue } from '../Task/TaskMap';

export type TaskId = string;

let idSequence = 1;
let lastTimestamp: number | undefined = undefined;

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

export interface TaskCore {
    readonly name: string;
    readonly args: Args;
}

export class Task implements TaskCore {
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

export interface TaskMatcher {
    (task: Task): boolean;
}

export interface TaskTransformer {
    (task: Task): Task;
}

export function isInQueue(queue: ProductionQueue): TaskMatcher {
    return (task: TaskCore) => getProductionQueue(task.name) === queue;
}

export function isBuildingPlanned(
    name: string,
    buildId: number | undefined,
    buildTypeId: number | undefined
) {
    return (task: TaskCore) => {
        if (name !== task.name) {
            return false;
        }
        if (buildId && task.args.buildId) {
            return buildId === task.args.buildId;
        }
        if (buildTypeId && task.args.buildTypeId) {
            return buildTypeId === task.args.buildTypeId;
        }
        return false;
    };
}

export function withTime(ts: number): TaskTransformer {
    return (task: Task) => new Task(task.id, ts, task.name, task.args);
}

export function withResources(resources: ResourcesInterface): TaskTransformer {
    return (task: Task) => new Task(task.id, task.ts, task.name, { ...task.args, resources });
}
