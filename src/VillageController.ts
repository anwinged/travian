import { VillageTaskCollection } from './VillageTaskCollection';
import { Task, TaskId } from './Queue/TaskProvider';
import { Args } from './Queue/Args';
import { VillageState } from './VillageState';
import { Resources } from './Core/Resources';
import { TryLaterError } from './Errors';
import { aroundMinutes } from './utils';

export class VillageController {
    private readonly villageId: number;
    private readonly taskCollection: VillageTaskCollection;
    private readonly state: VillageState;

    constructor(villageId: number, taskCollection: VillageTaskCollection, state: VillageState) {
        this.villageId = villageId;
        this.taskCollection = taskCollection;
        this.state = state;
    }

    getVillageId() {
        return this.villageId;
    }

    getReadyProductionTask(): Task | undefined {
        return this.taskCollection.getReadyForProductionTask();
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

    getAvailableForSendResources(): Resources {
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
        const performance = this.state.performance;
        const maxPossibleToStore = this.state.storage.capacity.sub(performance);
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
}
