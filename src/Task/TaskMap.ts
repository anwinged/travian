import { Scheduler } from '../Scheduler';
import { TaskController } from './TaskController';

export enum TaskType {
    Other = 1,
    Building,
    TrainUnit,
    UpgradeUnit,
    Celebration,
}

interface TaskOptions {
    type?: TaskType;
}

interface TaskDescription {
    ctor: Function;
    type: TaskType;
}

interface TaskMap {
    [name: string]: TaskDescription | undefined;
}

const taskMap: TaskMap = {};

export function registerTask(options: TaskOptions = {}) {
    return function(ctor: Function) {
        taskMap[ctor.name] = {
            ctor,
            type: options.type || TaskType.Other,
        };
    };
}

export function getTaskType(name: string): TaskType | undefined {
    const taskDescription = taskMap[name];
    if (taskDescription === undefined) {
        return undefined;
    }
    return taskDescription.type;
}

export function createTaskHandler(name: string, scheduler: Scheduler): TaskController | undefined {
    const taskDescription = taskMap[name];
    if (taskDescription === undefined) {
        return undefined;
    }
    const constructor = (taskDescription.ctor as unknown) as typeof TaskController;
    return new constructor(scheduler);
}
