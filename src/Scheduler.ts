import { timestamp } from './utils';
import { UpgradeBuildingTask } from './Task/UpgradeBuildingTask';
import { TaskQueue } from './Queue/TaskQueue';
import { SendOnAdventureTask } from './Task/SendOnAdventureTask';
import { BalanceHeroResourcesTask } from './Task/BalanceHeroResourcesTask';
import { Logger } from './Logger';
import { GrabVillageState } from './Task/GrabVillageState';
import { Action, ActionQueue, ImmutableActionList } from './Queue/ActionQueue';
import { UpdateResourceContracts } from './Task/UpdateResourceContracts';
import { Resources, ResourcesInterface } from './Core/Resources';
import { SendResourcesTask } from './Task/SendResourcesTask';
import { Args } from './Queue/Args';
import { ImmutableTaskList, Task, TaskId } from './Queue/TaskProvider';
import { ForgeImprovementTask } from './Task/ForgeImprovementTask';
import { getTaskType, TaskType } from './Task/TaskMap';
import { MARKET_ID } from './Core/Buildings';
import { VillageRepositoryInterface } from './VillageRepository';

export enum ContractType {
    UpgradeBuilding,
    ImproveTrooper,
}

interface ContractAttributes {
    type: ContractType;
    villageId?: number;
    buildId?: number;
    unitId?: number;
}

export class Scheduler {
    private taskQueue: TaskQueue;
    private actionQueue: ActionQueue;
    private villageRepository: VillageRepositoryInterface;
    private logger: Logger;

    constructor(
        taskQueue: TaskQueue,
        actionQueue: ActionQueue,
        villageRepository: VillageRepositoryInterface,
        logger: Logger
    ) {
        this.taskQueue = taskQueue;
        this.actionQueue = actionQueue;
        this.villageRepository = villageRepository;
        this.logger = logger;

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
        this.logger.info('PUSH TASK', name, args, ts);
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

    removeTask(taskId: TaskId) {
        this.taskQueue.remove(t => t.id === taskId);
        this.actionQueue.clear();
    }

    postponeTask(taskId: TaskId, seconds: number) {
        const task = this.taskQueue.seeItems().find(t => t.id === taskId);
        if (!task) {
            return;
        }

        const villageId = task.args.villageId;
        const modifyTime = (t: Task) => withTime(t, timestamp() + seconds);

        let predicateUsed = false;

        for (let taskTypePred of TASK_TYPE_PREDICATES) {
            if (taskTypePred(task.name) && villageId) {
                this.taskQueue.modify(t => sameVillage(villageId, t.args) && taskTypePred(t.name), modifyTime);
                predicateUsed = true;
            }
        }

        if (!predicateUsed) {
            this.taskQueue.modify(t => t.id === taskId, modifyTime);
        }

        if (villageId) {
            this.reorderVillageTasks(villageId);
        }
    }

    updateResources(resources: Resources, attr: ContractAttributes): void {
        if (attr.type === ContractType.UpgradeBuilding && attr.villageId && attr.buildId) {
            const count = this.taskQueue.modify(
                t =>
                    t.name === UpgradeBuildingTask.name &&
                    t.args.villageId === attr.villageId &&
                    t.args.buildId === attr.buildId,
                t => withResources(t, resources)
            );
            this.logger.info('Update', count, 'upgrade contracts', attr, resources);
        }
        if (attr.type === ContractType.ImproveTrooper && attr.villageId && attr.buildId && attr.unitId) {
            const count = this.taskQueue.modify(
                t =>
                    t.name === ForgeImprovementTask.name &&
                    t.args.villageId === attr.villageId &&
                    t.args.buildId === attr.buildId &&
                    t.args.unitId === attr.unitId,
                t => withResources(t, resources)
            );
            this.logger.info('Update', count, 'improve contracts', attr, resources);
        }
    }

    scheduleActions(actions: Array<Action>): void {
        this.actionQueue.assign(actions);
    }

    clearActions() {
        this.actionQueue.clear();
    }

    getVillageRequiredResources(villageId: number): Resources {
        const tasks = this.taskQueue
            .seeItems()
            .filter(t => sameVillage(villageId, t.args) && t.args.resources && t.name !== SendResourcesTask.name);
        const first = tasks.shift();
        if (first && first.args.resources) {
            return Resources.fromObject(first.args.resources);
        }
        return Resources.zero();
    }

    getTotalVillageRequiredResources(villageId: number): Resources {
        const tasks = this.taskQueue
            .seeItems()
            .filter(t => sameVillage(villageId, t.args) && t.args.resources && t.name !== SendResourcesTask.name);
        return tasks.reduce((acc, t) => acc.add(t.args.resources!), Resources.zero());
    }

    getResourceShipmentVillageIds(villageId: number): Array<number> {
        const tasks = this.taskQueue
            .seeItems()
            .filter(t => t.name === SendResourcesTask.name && t.args.villageId === villageId && t.args.targetVillageId);
        return tasks.map(t => t.args.targetVillageId!);
    }

    dropResourceTransferTasks(fromVillageId: number, toVillageId: number): void {
        this.taskQueue.remove(
            t =>
                t.name === SendResourcesTask.name &&
                t.args.villageId === fromVillageId &&
                t.args.targetVillageId === toVillageId
        );
    }

    scheduleResourceTransferTasks(fromVillageId: number, toVillageId: number): void {
        this.dropResourceTransferTasks(fromVillageId, toVillageId);
        const village = this.villageRepository.all().find(v => v.id === toVillageId);
        if (!village) {
            throw new Error('No village');
        }
        this.scheduleTask(SendResourcesTask.name, {
            villageId: fromVillageId,
            targetVillageId: toVillageId,
            coordinates: village.crd,
            buildTypeId: MARKET_ID,
            tabId: 5,
        });
    }

    private reorderVillageTasks(villageId: number) {
        const tasks = this.taskQueue.seeItems();

        for (let i = 0; i < TASK_TYPE_PREDICATES.length; ++i) {
            const taskTypePred = TASK_TYPE_PREDICATES[i];
            const lowTaskTypePredicates = TASK_TYPE_PREDICATES.slice(i + 1);
            const lastTaskTs = lastTaskTime(tasks, t => taskTypePred(t.name) && sameVillage(villageId, t.args));
            if (lastTaskTs) {
                for (let pred of lowTaskTypePredicates) {
                    this.taskQueue.modify(
                        t => pred(t.name) && sameVillage(villageId, t.args),
                        t => withTime(t, lastTaskTs + 1)
                    );
                }
            }
        }
    }
}

interface TaskNamePredicate {
    (name: string): boolean;
}

/**
 * List on non intersected task type predicates.
 *
 * Placed in order of execution priority. Order is important!
 */
const TASK_TYPE_PREDICATES: Array<TaskNamePredicate> = [
    (taskName: string) => getTaskType(taskName) === TaskType.TrainUnit,
    (taskName: string) => getTaskType(taskName) === TaskType.UpgradeUnit,
    (taskName: string) => getTaskType(taskName) === TaskType.Building,
    (taskName: string) => getTaskType(taskName) === TaskType.Celebration,
];

function sameVillage(villageId: number | undefined, args: Args) {
    return villageId !== undefined && args.villageId === villageId;
}

function withTime(task: Task, ts: number): Task {
    return new Task(task.id, ts, task.name, task.args);
}

function withResources(task: Task, resources: ResourcesInterface): Task {
    return new Task(task.id, task.ts, task.name, { ...task.args, resources });
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

/**
 * Calculates insert time for new task based on task type.
 */
function calculateInsertTime(tasks: ImmutableTaskList, name: string, args: Args, ts: number | undefined): number {
    const villageId = args.villageId;
    let insertedTs = ts;

    if (villageId && !insertedTs) {
        for (let taskTypePred of TASK_TYPE_PREDICATES) {
            const sameVillageAndTypePred = (t: Task) =>
                taskTypePred(name) && taskTypePred(t.name) && sameVillage(villageId, t.args);
            insertedTs = lastTaskTime(tasks, sameVillageAndTypePred);
            if (insertedTs) {
                insertedTs += 1;
            }
        }
    }

    return insertedTs || timestamp();
}
