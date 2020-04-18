import { timestamp } from './utils';
import { UpgradeBuildingTask } from './Task/UpgradeBuildingTask';
import { Task, TaskId, TaskList, TaskQueue } from './Storage/TaskQueue';
import { Args, Command } from './Common';
import { SendOnAdventureTask } from './Task/SendOnAdventureTask';
import { BalanceHeroResourcesTask } from './Task/BalanceHeroResourcesTask';
import { ConsoleLogger, Logger } from './Logger';
import { BuildBuildingTask } from './Task/BuildBuildingTask';
import { GrabVillageState } from './Task/GrabVillageState';
import { ActionQueue } from './Storage/ActionQueue';

export class Scheduler {
    private taskQueue: TaskQueue;
    private actionQueue: ActionQueue;
    private logger: Logger;

    constructor() {
        this.taskQueue = new TaskQueue();
        this.actionQueue = new ActionQueue();
        this.logger = new ConsoleLogger(this.constructor.name);

        // this.taskQueue.push(GrabVillageState.name, {}, timestamp());

        this.scheduleUniqTask(3600, SendOnAdventureTask.name);
        this.scheduleUniqTask(1200, BalanceHeroResourcesTask.name);
        this.scheduleUniqTask(180, GrabVillageState.name);
    }

    private scheduleUniqTask(seconds: number, name: string, args: Args = {}) {
        const taskScheduler = () => {
            if (!this.taskQueue.has(t => t.name === name)) {
                this.scheduleTask(name, args, timestamp() + Math.min(seconds, 5 * 60));
            }
        };
        taskScheduler();
        setInterval(taskScheduler, seconds * 1000);
    }

    getTaskItems(): TaskList {
        return this.taskQueue.seeItems();
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

    completeTask(id: TaskId) {
        this.taskQueue.remove(id);
        this.actionQueue.clear();
    }

    removeTask(id: TaskId) {
        this.taskQueue.remove(id);
        this.actionQueue.clear();
    }

    postponeTask(id: TaskId, deltaTs: number) {
        this.taskQueue.modify(
            t => t.id === id,
            t => withTime(t, timestamp() + deltaTs)
        );
    }

    postponeBuildingsInVillage(villageId: number, seconds: number) {
        this.taskQueue.modify(
            t => isBuildingTask(t.name) && sameVillage(villageId, t.args),
            t => withTime(t, timestamp() + seconds)
        );
    }

    scheduleActions(actions: Array<Command>): void {
        this.actionQueue.assign(actions);
    }

    clearActions() {
        this.actionQueue.clear();
    }
}

function isBuildingTask(taskName: string) {
    return taskName === BuildBuildingTask.name || taskName === UpgradeBuildingTask.name;
}

function sameVillage(villageId: number | undefined, args: Args) {
    return villageId !== undefined && args.villageId === villageId;
}

export function withTime(task: Task, ts: number): Task {
    return new Task(task.id, ts, task.name, task.args);
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
