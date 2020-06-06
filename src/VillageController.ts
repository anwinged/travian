import { VillageTaskCollection } from './VillageTaskCollection';
import { Task, TaskId } from './Queue/TaskProvider';
import { Args } from './Queue/Args';
import { VillageState } from './VillageState';
import { Resources } from './Core/Resources';
import { TryLaterError } from './Errors';
import { aroundMinutes } from './utils';
import { MerchantsInfo } from './Core/Market';
import { VillageStorage } from './Storage/VillageStorage';

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

    getReadyProductionTask(): Task | undefined {
        return this.state.firstReadyTask;
    }

    addTask(name: string, args: Args) {
        this.taskCollection.addTask(name, args);
    }

    removeTask(taskId: TaskId) {
        this.taskCollection.removeTask(taskId);
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
        const limit = this.state.storageOptimumFullness;
        const currentResources = this.state.resources;

        return currentResources.sub(limit).max(Resources.zero());
    }

    getFreeResources(): Resources {
        const balance = this.state.required.balance;
        const free = balance.max(Resources.zero());

        console.table([
            { name: 'Sender balance', ...balance },
            { name: 'Sender free', ...free },
        ]);

        const amount = free.amount();
        const threshold = this.state.settings.sendResourcesThreshold;

        if (amount < threshold) {
            return Resources.zero();
        }

        return free;
    }

    getRequiredResources(): Resources {
        const maxPossibleToStore = this.state.storageOptimumFullness;
        const currentResources = this.state.resources;
        const incomingResources = this.state.incomingResources;
        const requirementResources = this.state.required.resources;

        const missingResources = requirementResources
            .min(maxPossibleToStore)
            .sub(incomingResources)
            .sub(currentResources)
            .max(Resources.zero());

        console.table([
            { name: 'Recipient max possible', ...maxPossibleToStore },
            { name: 'Recipient resources', ...currentResources },
            { name: 'Recipient incoming', ...incomingResources },
            { name: 'Recipient requirements', ...requirementResources },
            { name: 'Recipient missing', ...missingResources },
        ]);

        return missingResources;
    }

    getAvailableToReceiveResources(): Resources {
        const maxPossibleToStore = this.state.storageOptimumFullness;
        const currentResources = this.state.resources;

        return maxPossibleToStore.sub(currentResources).max(Resources.zero());
    }
}
