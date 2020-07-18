import { DataStorage } from './DataStorage';
import { Resources, ResourcesInterface } from '../Core/Resources';
import { ResourceStorage } from '../Core/ResourceStorage';
import { IncomingMerchant, MerchantsInfo } from '../Core/Market';
import { VillageSettings, VillageSettingsDefaults } from '../Core/Village';
import { ProductionQueue } from '../Core/ProductionQueue';
import { Task, uniqTaskId } from '../Queue/TaskProvider';
import {
    BuildingSlot,
    BuildingSlotDefaults,
    ResourceSlot,
    ResourceSlotDefaults,
} from '../Core/Slot';
import { getNumber } from '../Helpers/Convert';

const RESOURCES_KEY = 'resources';
const CAPACITY_KEY = 'capacity';
const PERFORMANCE_KEY = 'performance';
const INCOMING_MERCHANTS_KEY = 'incoming_merchants';
const MERCHANTS_INFO_KEY = 'merchants_info';
const RESOURCE_SLOTS_KEY = 'resource_slots';
const BUILDING_SLOTS_KEY = 'building_slots';
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

    storeMerchantsInfo(info: MerchantsInfo): void {
        this.storage.set(MERCHANTS_INFO_KEY, info);
    }

    getMerchantsInfo(): MerchantsInfo {
        return this.storage.getTyped<MerchantsInfo>(MERCHANTS_INFO_KEY, {
            factory: () => ({ available: 0, carry: 0 }),
        });
    }

    storeIncomingMerchants(merchants: ReadonlyArray<IncomingMerchant>): void {
        this.storage.set(
            INCOMING_MERCHANTS_KEY,
            merchants.map(m => ({ ...m.resources, ts: m.ts }))
        );
    }

    getIncomingMerchants(): ReadonlyArray<IncomingMerchant> {
        const objects = this.storage.getTypedList<object>(INCOMING_MERCHANTS_KEY, {
            factory: () => ({}),
        });
        return objects.map((plain: object) => {
            const m = new IncomingMerchant(new Resources(0, 0, 0, 0), 0);
            if (typeof plain !== 'object') {
                return m;
            }
            const norm = plain as ResourcesInterface & { ts: number };
            return new IncomingMerchant(Resources.fromObject(norm), Number(norm.ts || 0));
        });
    }

    getResourceSlots(): ReadonlyArray<ResourceSlot> {
        return this.storage.getTypedList<ResourceSlot>(RESOURCE_SLOTS_KEY, {
            factory: () => Object.assign({}, ResourceSlotDefaults),
        });
    }

    storeResourceSlots(slots: ReadonlyArray<ResourceSlot>): void {
        this.storage.set(RESOURCE_SLOTS_KEY, slots);
    }

    getBuildingSlots(): ReadonlyArray<BuildingSlot> {
        return this.storage.getTypedList<BuildingSlot>(BUILDING_SLOTS_KEY, {
            factory: () => Object.assign({}, BuildingSlotDefaults),
        });
    }

    storeBuildingSlots(slots: ReadonlyArray<BuildingSlot>): void {
        this.storage.set(BUILDING_SLOTS_KEY, slots);
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

    storeTaskList(tasks: Array<Task>): void {
        this.storage.set(TASK_LIST_KEY, tasks);
    }
}
