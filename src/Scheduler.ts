import { timestamp } from './utils';
import { UpgradeBuildingTask } from './Task/UpgradeBuildingTask';
import { ImmutableTaskList, Task, TaskId, TaskQueue } from './Queue/TaskQueue';
import { Args, Command } from './Command';
import { SendOnAdventureTask } from './Task/SendOnAdventureTask';
import { BalanceHeroResourcesTask } from './Task/BalanceHeroResourcesTask';
import { ConsoleLogger, Logger } from './Logger';
import { BuildBuildingTask } from './Task/BuildBuildingTask';
import { GrabVillageState } from './Task/GrabVillageState';
import { ActionQueue, ImmutableActionList } from './Queue/ActionQueue';
import { UpdateResourceContracts } from './Task/UpdateResourceContracts';
import { TrainTroopTask } from './Task/TrainTroopTask';
import { Resources, ResourcesInterface } from './Core/Resources';
import { SendResourcesTask } from './Task/SendResourcesTask';

export class Scheduler {
    private taskQueue: TaskQueue;
    private actionQueue: ActionQueue;
    private logger: Logger;

    constructor() {
        this.taskQueue = new TaskQueue();
        this.actionQueue = new ActionQueue();
        this.logger = new ConsoleLogger(this.constructor.name);

        // this.taskQueue.push(GrabVillageState.name, {}, timestamp());
        // this.taskQueue.push(UpdateResourceContracts.name, {}, timestamp());
        // this.taskQueue.push(BalanceHeroResourcesTask.name, {}, timestamp());

        this.createUniqTaskTimer(2 * 60, GrabVillageState.name);
        this.createUniqTaskTimer(10 * 60, BalanceHeroResourcesTask.name);
        this.createUniqTaskTimer(20 * 60, UpdateResourceContracts.name);
        this.createUniqTaskTimer(60 * 60, SendOnAdventureTask.name);
    }

    private createUniqTaskTimer(seconds: number, name: string, args: Args = {}) {
        this.scheduleUniqTask(name, args, timestamp() + seconds - 10);
        setInterval(() => this.scheduleUniqTask(name, args, timestamp()), seconds * 1000);
    }

    getTaskItems(): ImmutableTaskList {
        return this.taskQueue.seeItems();
    }

    getActionItems(): ImmutableActionList {
        return this.actionQueue.seeItems();
    }

    nextTask(ts: number) {
        return this.taskQueue.get(ts);
    }

    nextAction() {
        return this.actionQueue.pop();
    }

    scheduleTask(name: string, args: Args, ts?: number | undefined): void {
        this.logger.log('PUSH TASK', name, args, ts);
        let insertedTs = calculateInsertTime(this.taskQueue.seeItems(), name, args, ts);
        this.taskQueue.push(name, args, insertedTs);
        if (args.villageId) {
            this.reorderVillageTasks(args.villageId);
        }
    }

    scheduleUniqTask(name: string, args: Args, ts?: number | undefined): void {
        let alreadyHasTask = this.taskQueue.has(t => t.name === name);
        if (!alreadyHasTask) {
            this.scheduleTask(name, args, ts);
        }
    }

    completeTask(taskId: TaskId) {
        this.taskQueue.remove(taskId);
        this.actionQueue.clear();
    }

    removeTask(taskId: TaskId) {
        this.taskQueue.remove(taskId);
        this.actionQueue.clear();
    }

    postponeTask(taskId: TaskId, seconds: number) {
        const task = this.taskQueue.seeItems().find(t => t.id === taskId);
        if (!task) {
            return;
        }

        const villageId = task.args.villageId;
        const modifyTime = t => withTime(t, timestamp() + seconds);
        const buildPred = t => sameVillage(villageId, t.args) && isBuildingTask(t.name);
        const trainPred = t => sameVillage(villageId, t.args) && isTrainTroopTask(t.name);

        if (isBuildingTask(task.name) && villageId) {
            this.taskQueue.modify(buildPred, modifyTime);
        } else if (isTrainTroopTask(task.name) && villageId) {
            this.taskQueue.modify(trainPred, modifyTime);
        } else {
            this.taskQueue.modify(t => t.id === taskId, modifyTime);
        }

        if (villageId) {
            this.reorderVillageTasks(villageId);
        }
    }

    updateResources(taskId: TaskId, resources: Resources): void {
        this.taskQueue.modify(
            t => t.id === taskId,
            t => withResources(t, resources)
        );
    }

    scheduleActions(actions: Array<Command>): void {
        this.actionQueue.assign(actions);
    }

    clearActions() {
        this.actionQueue.clear();
    }

    getVillageRequiredResources(villageId): Resources {
        const tasks = this.taskQueue
            .seeItems()
            .filter(t => sameVillage(villageId, t.args) && t.args.resources && t.name !== SendResourcesTask.name);
        const first = tasks.shift();
        if (first && first.args.resources) {
            return Resources.fromObject(first.args.resources);
        }
        return new Resources(0, 0, 0, 0);
    }

    getTotalVillageRequiredResources(villageId): Resources {
        const tasks = this.taskQueue.seeItems().filter(t => sameVillage(villageId, t.args) && t.args.resources);
        return tasks.reduce((acc, t) => acc.add(t.args.resources!), new Resources(0, 0, 0, 0));
    }

    private reorderVillageTasks(villageId: number) {
        const tasks = this.taskQueue.seeItems();
        const trainPred = t => isTrainTroopTask(t.name) && sameVillage(villageId, t.args);
        const buildPred = t => isBuildingTask(t.name) && sameVillage(villageId, t.args);
        const lastTrainTaskTs = lastTaskTime(tasks, trainPred);
        if (lastTrainTaskTs) {
            this.taskQueue.modify(buildPred, t => withTime(t, lastTrainTaskTs + 1));
        }
    }
}

interface TaskNamePredicate {
    (name: string): boolean;
}

function isTrainTroopTask(taskName: string) {
    return taskName === TrainTroopTask.name;
}

function isBuildingTask(taskName: string) {
    return taskName === BuildBuildingTask.name || taskName === UpgradeBuildingTask.name;
}

const TASK_TYPE_PREDICATES: Array<TaskNamePredicate> = [isTrainTroopTask, isBuildingTask];

function sameVillage(villageId: number | undefined, args: Args) {
    return villageId !== undefined && args.villageId === villageId;
}

function withTime(task: Task, ts: number): Task {
    return new Task(task.id, ts, task.name, task.args);
}

function withResources(task: Task, resources: ResourcesInterface): Task {
    return new Task(task.id, task.ts, task.name, { ...task.args, resources });
}

function firstTaskTime(tasks: ImmutableTaskList, predicate: (t: Task) => boolean): number | undefined {
    return tasks.find(predicate)?.ts;
}

function lastTaskTime(tasks: ImmutableTaskList, predicate: (t: Task) => boolean): number | undefined {
    const queuedTaskIndex = findLastIndex(tasks, predicate);
    if (queuedTaskIndex === undefined) {
        return undefined;
    }
    return tasks[queuedTaskIndex].ts;
}

function findLastIndex(tasks: ImmutableTaskList, predicate: (t: Task) => boolean): number | undefined {
    const count = tasks.length;
    const indexInReversed = tasks
        .slice()
        .reverse()
        .findIndex(predicate);
    if (indexInReversed < 0) {
        return undefined;
    }
    return count - 1 - indexInReversed;
}

function calculateInsertTime(tasks: ImmutableTaskList, name: string, args: Args, ts: number | undefined): number {
    const villageId = args.villageId;
    let insertedTs = ts;

    if (villageId && !insertedTs) {
        for (let taskTypePred of TASK_TYPE_PREDICATES) {
            const sameVillageAndTypePred = t => taskTypePred(name) && t.args.villageId === villageId && t.name === name;
            insertedTs = lastTaskTime(tasks, sameVillageAndTypePred);
            if (insertedTs) {
                insertedTs += 1;
            }
        }
    }

    return insertedTs || timestamp();
}
