import { timestamp } from './utils';
import { UpgradeBuildingTask } from './Task/UpgradeBuildingTask';
import { TaskId, TaskList, TaskQueue } from './Storage/TaskQueue';
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
            if (!this.taskQueue.hasNamed(name)) {
                this.taskQueue.push(name, args, timestamp() + Math.min(seconds, 5 * 60));
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

    scheduleTask(name: string, args: Args): void {
        this.logger.log('PUSH TASK', name, args);
        this.taskQueue.push(name, args, timestamp());
    }

    completeTask(id: TaskId) {
        this.taskQueue.complete(id);
        this.actionQueue.clear();
    }

    removeTask(id: TaskId) {
        this.taskQueue.remove(id);
        this.actionQueue.clear();
    }

    postponeTask(id: TaskId, deltaTs: number) {
        this.taskQueue.postpone(id, timestamp() + deltaTs);
    }

    postponeBuildingsInVillage(villageId: number, seconds: number) {
        this.taskQueue.modify(
            t => t.name === BuildBuildingTask.name && t.args.villageId === villageId,
            t => t.withTime(timestamp() + seconds)
        );
        this.taskQueue.modify(
            t => t.name === UpgradeBuildingTask.name && t.args.villageId === villageId,
            t => t.withTime(timestamp() + seconds)
        );
    }

    scheduleActions(actions: Array<Command>): void {
        this.actionQueue.assign(actions);
    }

    clearActions() {
        this.actionQueue.clear();
    }
}
