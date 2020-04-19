import { timestamp } from './utils';
import { UpgradeBuildingTask } from './Task/UpgradeBuildingTask';
import { Task, TaskId, TaskList, TaskQueue } from './Queue/TaskQueue';
import { Args, Command } from './Command';
import { SendOnAdventureTask } from './Task/SendOnAdventureTask';
import { BalanceHeroResourcesTask } from './Task/BalanceHeroResourcesTask';
import { ConsoleLogger, Logger } from './Logger';
import { BuildBuildingTask } from './Task/BuildBuildingTask';
import { GrabVillageState } from './Task/GrabVillageState';
import { ActionList, ActionQueue } from './Queue/ActionQueue';
import { Resources, ResourcesInterface } from './Game';
import { UpdateResourceContracts } from './Task/UpdateResourceContracts';

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

        this.createUniqTaskTimer(3 * 60, GrabVillageState.name);
        this.createUniqTaskTimer(10 * 60, UpdateResourceContracts.name);
        this.createUniqTaskTimer(20 * 60, BalanceHeroResourcesTask.name);
        this.createUniqTaskTimer(60 * 60, SendOnAdventureTask.name);
    }

    public createUniqTaskTimer(seconds: number, name: string, args: Args = {}) {
        const taskScheduler = () => {
            this.scheduleUniqTask(name, args, timestamp() + Math.min(seconds, 5 * 60));
        };
        taskScheduler();
        setInterval(taskScheduler, seconds * 1000);
    }

    getTaskItems(): TaskList {
        return this.taskQueue.seeItems();
    }

    getActionItems(): ActionList {
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
        const villageId = args.villageId;
        if (isBuildingTask(name)) {
            const insertedTs = calculateTimeToPushAfter(
                this.taskQueue.seeItems(),
                t => isBuildingTask(t.name) && sameVillage(villageId, t.args),
                ts
            );
            this.taskQueue.push(name, args, insertedTs);
        } else {
            this.taskQueue.push(name, args, ts || timestamp());
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
        if (isBuildingTask(task.name) && task.args.villageId) {
            this.taskQueue.modify(
                t => sameVillage(task.args.villageId, t.args),
                t => withTime(t, timestamp() + seconds)
            );
        } else {
            this.taskQueue.modify(
                t => t.id === taskId,
                t => withTime(t, timestamp() + seconds)
            );
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

    getVillageRequiredResources(villageId): ResourcesInterface | undefined {
        const tasks = this.taskQueue.seeItems().filter(t => sameVillage(villageId, t.args) && t.args.resources);
        const first = tasks.shift();
        if (first && first.args.resources) {
            return first.args.resources;
        }
        return undefined;
    }
}

function isBuildingTask(taskName: string) {
    return taskName === BuildBuildingTask.name || taskName === UpgradeBuildingTask.name;
}

function sameVillage(villageId: number | undefined, args: Args) {
    return villageId !== undefined && args.villageId === villageId;
}

function withTime(task: Task, ts: number): Task {
    return new Task(task.id, ts, task.name, task.args);
}

function withResources(task: Task, resources: ResourcesInterface): Task {
    return new Task(task.id, task.ts, task.name, { ...task.args, resources });
}

function calculateTimeToPushAfter(tasks: TaskList, predicate: (t: Task) => boolean, ts: number | undefined): number {
    const normalizedTs = ts || timestamp();
    const queuedTaskIndex = findLastIndex(tasks, predicate);
    if (queuedTaskIndex === undefined) {
        return normalizedTs;
    }
    const queuedTask = tasks[queuedTaskIndex];
    return Math.max(normalizedTs, queuedTask.ts + 1);
}

function findLastIndex(tasks: TaskList, predicate: (t: Task) => boolean): number | undefined {
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
