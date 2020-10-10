import { VillageTaskCollection } from './VillageTaskCollection';
import { Args } from '../Queue/Args';
import { TaskState, VillageState } from './VillageState';
import { Resources } from '../Core/Resources';
import { MerchantsInfo } from '../Core/Market';
import { VillageStorage } from '../Storage/VillageStorage';
import { ReceiveResourcesMode } from '../Core/Village';
import { ResourceType } from '../Core/ResourceType';
import { UpgradeBuildingTask } from '../Handler/Task/UpgradeBuildingTask';
import { GARNER_ID, WAREHOUSE_ID } from '../Core/Buildings';
import { first } from '../Helpers/Collection';
import { isBuildingPlanned } from '../Queue/Task';
import { TaskId } from '../Queue/TaskId';

export class VillageController {
    private readonly villageId: number;
    private readonly storage: VillageStorage;
    private readonly taskCollection: VillageTaskCollection;
    private readonly state: VillageState;

    constructor(
        villageId: number,
        storage: VillageStorage,
        taskCollection: VillageTaskCollection,
        state: VillageState
    ) {
        this.villageId = villageId;
        this.storage = storage;
        this.taskCollection = taskCollection;
        this.state = state;
    }

    getVillageId() {
        return this.villageId;
    }

    getState(): VillageState {
        return this.state;
    }

    getReadyProductionTask(): TaskState | undefined {
        return this.state.firstReadyTask;
    }

    addTask(name: string, args: Args) {
        this.taskCollection.addTask(name, args);
    }

    removeTask(taskId: TaskId) {
        this.taskCollection.removeTask(taskId);
    }

    upTask(taskId: TaskId) {
        this.taskCollection.upTask(taskId);
    }

    downTask(taskId: TaskId) {
        this.taskCollection.downTask(taskId);
    }

    postponeTask(taskId: TaskId, seconds: number) {
        this.taskCollection.postponeTask(taskId, seconds);
    }

    getMerchantsInfo(): MerchantsInfo {
        return this.storage.getMerchantsInfo();
    }

    getSendResourcesMultiplier(): number {
        return this.state.settings.sendResourcesMultiplier;
    }

    getOverflowResources(): Resources {
        const limit = this.state.storage.optimumFullness;
        const currentResources = this.state.resources;

        return currentResources.sub(limit).max(Resources.zero());
    }

    getFreeResources(): Resources {
        const mode = this.state.settings.receiveResourcesMode;
        const requirementResources = this.state.required.resources;
        const optimumToStoreResources = this.state.storage.optimumFullness;

        switch (mode) {
            case ReceiveResourcesMode.Required:
                return this.calcFreeResources(requirementResources);
            case ReceiveResourcesMode.Optimum:
                return this.calcFreeResources(optimumToStoreResources);
        }
    }

    private calcFreeResources(targetResources: Resources): Resources {
        const currentResources = this.state.resources;
        const free = currentResources.sub(targetResources).max(Resources.zero());

        const amount = free.amount();
        const threshold = this.state.settings.sendResourcesThreshold;

        if (amount < threshold) {
            return Resources.zero();
        }

        return free;
    }

    getRequiredResources(): Resources {
        const mode = this.state.settings.receiveResourcesMode;
        const optimumToStoreResources = this.state.storage.optimumFullness;
        const requirementResources = this.state.required.resources;

        switch (mode) {
            case ReceiveResourcesMode.Required:
                return this.calcRequiredResources(requirementResources);
            case ReceiveResourcesMode.Optimum:
                return this.calcRequiredResources(optimumToStoreResources);
        }
    }

    private calcRequiredResources(targetResources: Resources): Resources {
        const optimumToStoreResources = this.state.storage.optimumFullness;
        const currentResources = this.state.resources;
        const incomingResources = this.state.incomingResources;

        return targetResources
            .min(optimumToStoreResources)
            .sub(currentResources)
            .sub(incomingResources)
            .max(Resources.zero());
    }

    getAvailableToReceiveResources(): Resources {
        const optimumToStoreResources = this.state.storage.optimumFullness;
        const currentResources = this.state.resources;

        return optimumToStoreResources.sub(currentResources).max(Resources.zero());
    }

    toggleReceiveResourcesMode(): void {
        const current = this.state.settings.receiveResourcesMode;

        let next;
        switch (current) {
            case ReceiveResourcesMode.Required:
                next = ReceiveResourcesMode.Optimum;
                break;
            case ReceiveResourcesMode.Optimum:
                next = ReceiveResourcesMode.Required;
                break;
        }

        const newSettings = { ...this.state.settings, receiveResourcesMode: next };
        this.storage.storeSettings(newSettings);
    }

    planTasks(): void {
        if (this.state.tasks.length >= 100) {
            return;
        }
        this.planCropBuilding();
        this.planWarehouseBuilding();
        this.planGranaryBuilding();
    }

    private planCropBuilding() {
        const performance = this.state.performance;
        if (performance.crop >= 30) {
            return;
        }

        const resourceSlots = this.storage.getResourceSlots();
        const tasks = this.taskCollection.getTasks();

        const cropSlots = resourceSlots.filter(
            (s) => s.type === ResourceType.Crop && !s.isMaxLevel
        );
        if (cropSlots.length === 0) {
            return;
        }

        // Check, if crop field is building now
        const underContraction = cropSlots.find((s) => s.isUnderConstruction);
        if (underContraction !== undefined) {
            return;
        }

        // Check, if we already have crop task in queue
        const cropBuildIds = cropSlots.map((s) => s.buildId);
        for (let buildId of cropBuildIds) {
            const upgradeTask = tasks.find(
                isBuildingPlanned(UpgradeBuildingTask.name, buildId, undefined)
            );
            if (upgradeTask !== undefined) {
                return;
            }
        }

        // Find ready for building slots and sort them by level
        cropSlots.sort((s1, s2) => s1.level - s2.level);

        const targetCropBuildId = first(cropSlots)?.buildId;
        if (!targetCropBuildId) {
            return;
        }

        this.taskCollection.addTaskAsFirst(UpgradeBuildingTask.name, {
            buildId: targetCropBuildId,
        });
    }

    private planWarehouseBuilding(): void {
        this.planStorageBuilding(WAREHOUSE_ID, (t) => !t.isEnoughWarehouseCapacity);
    }

    private planGranaryBuilding(): void {
        this.planStorageBuilding(GARNER_ID, (t) => !t.isEnoughGranaryCapacity);
    }

    private planStorageBuilding(
        buildTypeId: number,
        checkNeedEnlargeFunc: (task: TaskState) => boolean
    ): void {
        const buildingSlots = this.storage.getBuildingSlots();

        const storageSlots = buildingSlots.filter(
            (s) => s.buildTypeId === buildTypeId && !s.isMaxLevel
        );
        if (storageSlots.length === 0) {
            return;
        }

        // Check, if storage is building now
        const underConstruction = storageSlots.find((s) => s.isUnderConstruction);
        if (underConstruction !== undefined) {
            return;
        }

        const tasks = this.state.tasks;

        // Check, if we have storage is in building queue
        const storageBuildIds = storageSlots.map((s) => s.buildId);
        for (let buildId of storageBuildIds) {
            const upgradeTask = tasks.find(
                isBuildingPlanned(UpgradeBuildingTask.name, buildId, buildTypeId)
            );
            if (upgradeTask !== undefined) {
                return;
            }
        }

        const needStorageEnlargeTasks = tasks.filter(checkNeedEnlargeFunc);
        if (needStorageEnlargeTasks.length === 0) {
            return;
        }

        const firstSlot = first(storageSlots);
        if (firstSlot) {
            this.addTask(UpgradeBuildingTask.name, { buildId: firstSlot.buildId, buildTypeId });
        }
    }
}
