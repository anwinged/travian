import { VillageStorage } from '../Storage/VillageStorage';
import { Task, TaskId, uniqTaskId, withResources, withTime } from '../Queue/TaskProvider';
import { Args } from '../Queue/Args';
import { Resources } from '../Core/Resources';
import { ContractAttributes, ContractType } from '../Core/Contract';
import { UpgradeBuildingTask } from '../Task/UpgradeBuildingTask';
import { ForgeImprovementTask } from '../Task/ForgeImprovementTask';
import { isProductionTask } from '../Task/TaskMap';
import { timestamp } from '../Helpers/Time';

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
        const tasks = this.getTasks();
        tasks.push(this.createVillageTask(name, args));
        this.storage.storeTaskList(tasks);
    }

    addTaskAsFirst(name: string, args: Args) {
        const tasks = this.getTasks();
        tasks.unshift(this.createVillageTask(name, args));
        this.storage.storeTaskList(tasks);
    }

    private createVillageTask(name: string, args: Args): Task {
        if (!isProductionTask(name)) {
            throw new Error(`Task "${name}" is not production task`);
        }

        return new Task(uniqTaskId(), 0, name, { ...args, villageId: this.villageId });
    }

    removeTask(taskId: TaskId) {
        this.removeTasks(t => t.id === taskId);
    }

    upTask(taskId: TaskId): void {
        const tasks = this.storage.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index < 0 || index === 0) {
            return;
        }
        const movedTask = tasks.splice(index, 1)[0];
        tasks.splice(index - 1, 0, movedTask);
        this.storage.storeTaskList(tasks);
    }

    downTask(taskId: TaskId) {
        const tasks = this.storage.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index < 0 || index === tasks.length - 1) {
            return;
        }
        const movedTask = tasks.splice(index, 1)[0];
        tasks.splice(index + 1, 0, movedTask);
        this.storage.storeTaskList(tasks);
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
}
