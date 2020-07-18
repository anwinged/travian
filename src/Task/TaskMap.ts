import { Scheduler } from '../Scheduler';
import { TaskController } from './TaskController';
import {
    OrderedProductionQueues,
    ProductionQueue,
    TaskNamePredicate,
} from '../Core/ProductionQueue';
import { VillageFactory } from '../Village/VillageFactory';

interface TaskOptions {
    queue?: ProductionQueue;
}

interface TaskDescription {
    ctor: Function;
    queue?: ProductionQueue;
}

interface TaskMap {
    [name: string]: TaskDescription | undefined;
}

const taskMap: TaskMap = {};

export function registerTask(options: TaskOptions = {}) {
    return function(ctor: Function) {
        taskMap[ctor.name] = {
            ctor,
            queue: options.queue,
        };
    };
}

export function getProductionQueue(name: string): ProductionQueue | undefined {
    const taskDescription = taskMap[name];
    if (taskDescription === undefined) {
        return undefined;
    }
    return taskDescription.queue;
}

export function createTaskHandler(
    name: string,
    scheduler: Scheduler,
    factory: VillageFactory
): TaskController | undefined {
    const taskDescription = taskMap[name];
    if (taskDescription === undefined) {
        return undefined;
    }
    const constructor = (taskDescription.ctor as unknown) as typeof TaskController;
    return new constructor(scheduler, factory);
}

/**
 * List on non intersected task queue predicates.
 */
const TASK_TYPE_PREDICATES: Array<TaskNamePredicate> = OrderedProductionQueues.map(queue => {
    return (taskName: string) => getProductionQueue(taskName) === queue;
});

export function isProductionTask(taskName: string): boolean {
    return TASK_TYPE_PREDICATES.reduce((memo, predicate) => memo || predicate(taskName), false);
}
