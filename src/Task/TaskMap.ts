import { Scheduler } from '../Scheduler';
import { TaskController } from './TaskController';
import { ProductionQueue } from '../Core/ProductionQueue';
import { VillageFactory } from '../VillageFactory';

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
