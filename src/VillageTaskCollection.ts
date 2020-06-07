import { VillageStorage } from './Storage/VillageStorage';
import { isInQueue, Task, TaskId, uniqTaskId, withResources, withTime } from './Queue/TaskProvider';
import { Args } from './Queue/Args';
import { isProductionTask, OrderedProductionQueues, ProductionQueue } from './Core/ProductionQueue';
import { timestamp } from './utils';
import { Resources } from './Core/Resources';
import { ContractAttributes, ContractType } from './Core/Contract';
import { UpgradeBuildingTask } from './Task/UpgradeBuildingTask';
import { ForgeImprovementTask } from './Task/ForgeImprovementTask';
import * as _ from 'underscore';

export interface QueueTasks {
    queue: ProductionQueue;
    tasks: Array<Task>;
    finishTs: number;
}

export class VillageTaskCollection {
    private readonly storage: VillageStorage;
    private readonly villageId: number;

    constructor(villageId: number, storage: VillageStorage) {
        this.villageId = villageId;
        this.storage = storage;
    }

    getTasks(): Array<Task> {
        return this.storage.getTasks();
    }

    private modifyTasks(predicate: (t: Task) => boolean, modifier: (t: Task) => Task): void {
        const tasks = this.getTasks();
        const modified = tasks.map(t => (predicate(t) ? modifier(t) : t));
        this.storage.storeTaskList(modified);
    }

    private removeTasks(predicate: (t: Task) => boolean): void {
        const tasks = this.getTasks();
        const remaining = tasks.filter(t => !predicate(t));
        this.storage.storeTaskList(remaining);
    }

    addTask(name: string, args: Args) {
        if (!isProductionTask(name)) {
            throw new Error(`Task "${name}" is not production task`);
        }
        if (args.villageId !== this.villageId) {
            throw new Error(
                `Task village id (${args.villageId}) not equal controller village id (${this.villageId}`
            );
        }
        const task = new Task(uniqTaskId(), 0, name, { villageId: this.villageId, ...args });

        const tasks = this.getTasks();
        tasks.push(task);
        this.storage.storeTaskList(tasks);
    }

    removeTask(taskId: TaskId) {
        this.removeTasks(t => t.id === taskId);
    }

    postponeTask(taskId: TaskId, seconds: number) {
        const modifyTime = withTime(timestamp() + seconds);
        this.modifyTasks(task => task.id === taskId, modifyTime);
    }

    updateResourcesInTasks(resources: Resources, attr: ContractAttributes): void {
        if (attr.type === ContractType.UpgradeBuilding && attr.buildId) {
            const predicate = (t: Task) =>
                t.name === UpgradeBuildingTask.name && t.args.buildId === attr.buildId;
            this.modifyTasks(predicate, withResources(resources));
        }
        if (attr.type === ContractType.ImproveTrooper && attr.buildId && attr.unitId) {
            const predicate = (t: Task) =>
                t.name === ForgeImprovementTask.name &&
                t.args.buildId === attr.buildId &&
                t.args.unitId === attr.unitId;
            this.modifyTasks(predicate, withResources(resources));
        }
    }

    getGroupedByQueueTasks(): Array<QueueTasks> {
        const tasks = this.storage.getTasks();
        const result: Array<QueueTasks> = [];
        for (let queue of OrderedProductionQueues) {
            result.push({
                queue,
                tasks: tasks.filter(isInQueue(queue)),
                finishTs: this.storage.getQueueTaskEnding(queue),
            });
        }
        return result;
    }

    getFrontierTaskResources(): Resources {
        let result = Resources.zero();
        const groups = this.getGroupedByQueueTasks();
        for (let group of groups) {
            const firstTask = _.first(group.tasks);
            if (firstTask && firstTask.args.resources) {
                result = result.add(Resources.fromObject(firstTask.args.resources));
            }
        }
        return result;
    }

    getAllTasksResources(): Resources {
        const tasks = this.storage.getTasks().filter(t => t.args.resources);
        return tasks.reduce((acc, t) => acc.add(t.args.resources!), Resources.zero());
    }
}
