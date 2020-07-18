import { Args } from './Args';
import { ResourcesInterface } from '../Core/Resources';
import { ProductionQueue } from '../Core/ProductionQueue';
import { getProductionQueue } from '../Handler/TaskMap';
import { TaskId } from './TaskId';

export interface TaskCore {
    readonly id: TaskId;
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

export interface TaskMatcher {
    (task: TaskCore): boolean;
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
