import { around, timestamp } from './utils';
import { TaskQueue } from './Queue/TaskQueue';
import { BalanceHeroResourcesTask } from './Task/BalanceHeroResourcesTask';
import { Logger } from './Logger';
import { GrabVillageState } from './Task/GrabVillageState';
import { Action, ActionQueue, ImmutableActionList } from './Queue/ActionQueue';
import { UpdateResourceContracts } from './Task/UpdateResourceContracts';
import { SendResourcesTask } from './Task/SendResourcesTask';
import { Args } from './Queue/Args';
import { ImmutableTaskList, Task, TaskId, uniqTaskId, withTime } from './Queue/TaskProvider';
import { VillageRepositoryInterface } from './VillageRepository';
import { isProductionTask } from './Core/ProductionQueue';
import { VillageFactory } from './VillageFactory';
import { RunVillageProductionTask } from './Task/RunVillageProductionTask';

export interface NextExecution {
    task?: Task;
    action?: Action;
}

export class Scheduler {
    private readonly taskQueue: TaskQueue;
    private readonly actionQueue: ActionQueue;
    private readonly villageRepository: VillageRepositoryInterface;
    private readonly villageControllerFactory: VillageFactory;
    private readonly logger: Logger;

    constructor(
        taskQueue: TaskQueue,
        actionQueue: ActionQueue,
        villageRepository: VillageRepositoryInterface,
        villageControllerFactory: VillageFactory,
        logger: Logger
    ) {
        this.taskQueue = taskQueue;
        this.actionQueue = actionQueue;
        this.villageRepository = villageRepository;
        this.villageControllerFactory = villageControllerFactory;
        this.logger = logger;

        // this.taskQueue.push(GrabVillageState.name, {}, timestamp());
        // this.taskQueue.push(UpdateResourceContracts.name, {}, timestamp());
        // this.taskQueue.push(BalanceHeroResourcesTask.name, {}, timestamp());

        const villages = this.villageRepository.all();
        for (let village of villages) {
            this.createUniqTaskTimer(5 * 60, RunVillageProductionTask.name, {
                villageId: village.id,
            });
        }

        this.createUniqTaskTimer(10 * 60, GrabVillageState.name);
        this.createUniqTaskTimer(10 * 60, SendResourcesTask.name);
        this.createUniqTaskTimer(10 * 60, BalanceHeroResourcesTask.name);
        this.createUniqTaskTimer(20 * 60, UpdateResourceContracts.name);
        // this.createUniqTaskTimer(60 * 60, SendOnAdventureTask.name);
    }

    private createUniqTaskTimer(seconds: number, name: string, args: Args = {}) {
        const firstDelay = around(seconds - 10, 0.2);
        const intervalTime = around(seconds, 0.2) * 1000;
        this.scheduleUniqTask(name, args, timestamp() + firstDelay);
        setInterval(() => this.scheduleUniqTask(name, args, timestamp()), intervalTime);
    }

    getTaskItems(): ImmutableTaskList {
        return this.taskQueue.seeItems();
    }

    getActionItems(): ImmutableActionList {
        return this.actionQueue.seeItems();
    }

    nextTask(ts: number): NextExecution {
        const task = this.taskQueue.get(ts);

        // Task not found - next task not ready or queue is empty
        if (!task) {
            this.clearActions();
            return {};
        }

        const action = this.actionQueue.pop();

        // Action not found - task is new
        if (!action) {
            return { task: this.replaceTask(task) };
        }

        // Task in action not equals current task it - rerun task
        if (action.args.taskId !== task.id) {
            this.clearActions();
            return { task: this.replaceTask(task) };
        }

        return { task, action };
    }

    private replaceTask(task: Task): Task | undefined {
        if (task.name === RunVillageProductionTask.name && task.args.villageId) {
            const villageId = task.args.villageId;
            const controller = this.villageControllerFactory.createController(villageId);
            const villageTask = controller.getReadyProductionTask();
            if (villageTask) {
                this.removeTask(task.id);
                const newTask = new Task(villageTask.id, 0, villageTask.name, {
                    ...villageTask.args,
                    villageId: controller.getVillageId(),
                });
                this.taskQueue.add(newTask);
                return newTask;
            }
        }
        return task;
    }

    scheduleTask(name: string, args: Args, ts?: number | undefined): void {
        if (isProductionTask(name) && args.villageId) {
            const controller = this.villageControllerFactory.createController(args.villageId);
            controller.addTask(name, args);
        } else {
            this.logger.info('Schedule task', name, args, ts);
            this.taskQueue.add(new Task(uniqTaskId(), ts || timestamp(), name, args));
        }
    }

    scheduleUniqTask(name: string, args: Args, ts?: number | undefined): void {
        let alreadyHasTask;
        if (args.villageId) {
            alreadyHasTask = this.taskQueue.has(
                t => t.name === name && t.args.villageId === args.villageId
            );
        } else {
            alreadyHasTask = this.taskQueue.has(t => t.name === name);
        }

        if (!alreadyHasTask) {
            this.scheduleTask(name, args, ts);
        }
    }

    removeTask(taskId: TaskId) {
        this.taskQueue.remove(t => t.id === taskId);
        this.actionQueue.clear();
    }

    completeTask(taskId: TaskId) {
        const task = this.taskQueue.findById(taskId);
        const villageId = task ? task.args.villageId : undefined;
        if (villageId) {
            const controller = this.villageControllerFactory.createController(villageId);
            controller.removeTask(taskId);
        }
        this.removeTask(taskId);
    }

    postponeTask(taskId: TaskId, seconds: number) {
        const task = this.taskQueue.seeItems().find(t => t.id === taskId);
        if (!task) {
            return;
        }

        if (isProductionTask(task.name) && task.args.villageId) {
            const controller = this.villageControllerFactory.createController(task.args.villageId);
            controller.postponeTask(taskId, seconds);
            this.removeTask(taskId);
        } else {
            const modifyTime = withTime(timestamp() + seconds);
            this.taskQueue.modify(t => t.id === taskId, modifyTime);
        }
    }

    scheduleActions(actions: Array<Action>): void {
        this.actionQueue.assign(actions);
    }

    clearActions() {
        this.actionQueue.clear();
    }
}
