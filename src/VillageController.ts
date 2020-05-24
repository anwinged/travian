import { Task, TaskId, uniqTaskId, withResources, withTime } from './Queue/TaskProvider';
import { VillageStorage } from './Storage/VillageStorage';
import { Args } from './Queue/Args';
import { isProductionTask, ProductionQueue, ProductionQueueTypes } from './Core/ProductionQueue';
import { Resources } from './Core/Resources';
import { UpgradeBuildingTask } from './Task/UpgradeBuildingTask';
import { ForgeImprovementTask } from './Task/ForgeImprovementTask';
import { ContractType, ContractAttributes } from './Core/Contract';
import { timestamp } from './utils';
import { getProductionQueue } from './Task/TaskMap';

export class VillageController {
    private readonly _villageId: number;
    private readonly _storage: VillageStorage;

    constructor(villageId: number, storage: VillageStorage) {
        this._villageId = villageId;
        this._storage = storage;
    }

    get villageId() {
        return this._villageId;
    }

    getStorage(): VillageStorage {
        return this._storage;
    }

    addTask(name: string, args: Args) {
        if (!isProductionTask(name)) {
            throw new Error(`Task "${name}" is not production task`);
        }
        if (args.villageId !== this._villageId) {
            throw new Error(`Task village id (${args.villageId}) not equal controller village id (${this._villageId}`);
        }
        const task = new Task(uniqTaskId(), 0, name, { villageId: this._villageId, ...args });
        this._storage.addTask(task);
    }

    getTasks(): Array<Task> {
        return this._storage.getTasks();
    }

    removeTask(taskId: TaskId) {
        this._storage.removeTasks(t => t.id === taskId);
    }

    getTasksInProductionQueue(queue: ProductionQueue): Array<Task> {
        return this._storage.getTasks().filter(task => getProductionQueue(task.name) === queue);
    }

    getReadyProductionTask(): Task | undefined {
        let sortedTasks: Array<Task> = [];
        for (let queue of ProductionQueueTypes) {
            const tasks = this.getTasksInProductionQueue(queue);
            sortedTasks = sortedTasks.concat(tasks);
        }
        return sortedTasks.shift();
    }

    postponeTask(taskId: TaskId, seconds: number) {
        const modifyTime = withTime(timestamp() + seconds);
        this._storage.modifyTasks(task => task.id === taskId, modifyTime);
    }

    updateResources(resources: Resources, attr: ContractAttributes): void {
        if (attr.type === ContractType.UpgradeBuilding && attr.buildId) {
            const predicate = (t: Task) => t.name === UpgradeBuildingTask.name && t.args.buildId === attr.buildId;
            this._storage.modifyTasks(predicate, withResources(resources));
        }
        if (attr.type === ContractType.ImproveTrooper && attr.buildId && attr.unitId) {
            const predicate = (t: Task) =>
                t.name === ForgeImprovementTask.name &&
                t.args.buildId === attr.buildId &&
                t.args.unitId === attr.unitId;
            this._storage.modifyTasks(predicate, withResources(resources));
        }
    }

    getVillageRequiredResources(): Resources {
        const tasks = this._storage.getTasks().filter(t => t.args.resources);
        const first = tasks.shift();
        if (first && first.args.resources) {
            return Resources.fromObject(first.args.resources);
        }
        return Resources.zero();
    }

    getTotalVillageRequiredResources(): Resources {
        const tasks = this._storage.getTasks().filter(t => t.args.resources);
        return tasks.reduce((acc, t) => acc.add(t.args.resources!), Resources.zero());
    }
}
