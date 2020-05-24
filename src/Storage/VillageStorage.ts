import { DataStorage } from '../DataStorage';
import { BuildingQueueInfo } from '../Game';
import { Resources, ResourcesInterface } from '../Core/Resources';
import { ResourceStorage } from '../Core/ResourceStorage';
import { IncomingMerchant } from '../Core/Market';
import { VillageSettings, VillageSettingsDefaults } from '../Core/Village';
import { ProductionQueue } from '../Core/ProductionQueue';
import { getNumber } from '../utils';
import { Task, TaskList, uniqTaskId } from '../Queue/TaskProvider';

const RESOURCES_KEY = 'resources';
const CAPACITY_KEY = 'capacity';
const PERFORMANCE_KEY = 'performance';
const BUILDING_QUEUE_INFO_KEY = 'building_queue_info';
const INCOMING_MERCHANTS_KEY = 'incoming_merchants';
const SETTINGS_KEY = 'settings';
const QUEUE_ENDING_TIME_KEY = 'queue_ending_time';
const TASK_LIST_KEY = 'tasks';

const ResourceOptions = {
    factory: () => new Resources(0, 0, 0, 0),
};

export class VillageStorage {
    private storage: DataStorage;
    constructor(villageId: number) {
        this.storage = new DataStorage(`village.${villageId}`);
    }

    storeResources(resources: Resources) {
        this.storage.set(RESOURCES_KEY, resources);
    }

    getResources(): Resources {
        return this.storage.getTyped(RESOURCES_KEY, ResourceOptions);
    }

    storeResourceStorage(storage: ResourceStorage) {
        this.storage.set(CAPACITY_KEY, storage);
    }

    getResourceStorage(): ResourceStorage {
        let plain = this.storage.get(CAPACITY_KEY);
        let res = new ResourceStorage(0, 0);
        return Object.assign(res, plain) as ResourceStorage;
    }

    storeResourcesPerformance(resources: Resources) {
        this.storage.set(PERFORMANCE_KEY, resources);
    }

    getResourcesPerformance(): Resources {
        return this.storage.getTyped(PERFORMANCE_KEY, ResourceOptions);
    }

    storeBuildingQueueInfo(info: BuildingQueueInfo): void {
        this.storage.set(BUILDING_QUEUE_INFO_KEY, info);
    }

    getBuildingQueueInfo(): BuildingQueueInfo {
        let plain = this.storage.get(BUILDING_QUEUE_INFO_KEY);
        let res = new BuildingQueueInfo(0);
        return Object.assign(res, plain) as BuildingQueueInfo;
    }

    storeIncomingMerchants(merchants: ReadonlyArray<IncomingMerchant>): void {
        this.storage.set(
            INCOMING_MERCHANTS_KEY,
            merchants.map(m => ({ ...m.resources, ts: m.ts }))
        );
    }

    getIncomingMerchants(): ReadonlyArray<IncomingMerchant> {
        const objects = this.storage.getTypedList<object>(INCOMING_MERCHANTS_KEY, { factory: () => ({}) });
        return objects.map((plain: object) => {
            const m = new IncomingMerchant(new Resources(0, 0, 0, 0), 0);
            if (typeof plain !== 'object') {
                return m;
            }
            const norm = plain as ResourcesInterface & { ts: number };
            return new IncomingMerchant(Resources.fromObject(norm), Number(norm.ts || 0));
        });
    }

    getSettings(): VillageSettings {
        return this.storage.getTyped<VillageSettings>(SETTINGS_KEY, {
            factory: () => Object.assign({}, VillageSettingsDefaults),
        });
    }

    storeSettings(settings: VillageSettings) {
        this.storage.set(SETTINGS_KEY, settings);
    }

    private queueKey(queue: ProductionQueue): string {
        return QUEUE_ENDING_TIME_KEY + '.' + queue;
    }

    getQueueTaskEnding(queue: ProductionQueue): number {
        const key = this.queueKey(queue);
        return getNumber(this.storage.get(key)) || 0;
    }

    storeQueueTaskEnding(queue: ProductionQueue, ts: number): void {
        const key = this.queueKey(queue);
        this.storage.set(key, ts);
    }

    getTasks(): Array<Task> {
        return this.storage.getTypedList<Task>(TASK_LIST_KEY, {
            factory: () => new Task(uniqTaskId(), 0, '', {}),
        });
    }

    addTask(task: Task): void {
        const tasks = this.getTasks();
        tasks.push(task);
        this.storeTaskList(tasks);
    }

    modifyTasks(predicate: (t: Task) => boolean, modifier: (t: Task) => Task): number {
        const [matched, other] = this.split(predicate);
        const modified = matched.map(modifier);
        const modifiedCount = modified.length;
        this.storeTaskList(modified.concat(other));
        return modifiedCount;
    }

    removeTasks(predicate: (t: Task) => boolean): number {
        const [_, other] = this.split(predicate);
        const result = other.length;
        this.storeTaskList(other);
        return result;
    }

    private split(predicate: (t: Task) => boolean): [TaskList, TaskList] {
        const matched: TaskList = [];
        const other: TaskList = [];
        this.getTasks().forEach(t => {
            if (predicate(t)) {
                matched.push(t);
            } else {
                other.push(t);
            }
        });
        return [matched, other];
    }

    private storeTaskList(tasks: Array<Task>): void {
        this.storage.set(TASK_LIST_KEY, tasks);
    }
}
