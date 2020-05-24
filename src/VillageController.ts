import { VillageTaskCollection } from './VillageTaskCollection';
import { Task, TaskId } from './Queue/TaskProvider';
import { Args } from './Queue/Args';
import { VillageState } from './VillageState';

export class VillageController {
    private readonly villageId: number;
    private taskCollection: VillageTaskCollection;
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
        return this.taskCollection.getReadyProductionTask();
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
}
