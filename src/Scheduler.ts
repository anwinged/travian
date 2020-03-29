import { markPage, sleepLong, sleepShort } from './utils';
import { Queue, QueueItem } from './Queue';
import UpgradeBuildingTask from './Task/UpgradeBuildingTask';
import GoToBuildingAction from './Action/GoToBuildingAction';
import UpgradeBuildingAction from './Action/UpgradeBuildingAction';

const ACTION_QUEUE = 'action_queue';
const TASK_QUEUE = 'task_queue';

export default class Scheduler {
    taskQueue: Queue;
    actionQueue: Queue;

    constructor() {
        this.taskQueue = new Queue(TASK_QUEUE);
        this.actionQueue = new Queue(ACTION_QUEUE);
    }

    async run() {
        await sleepShort();
        markPage('Executor');
        while (true) {
            await sleepLong();
            const actionItem = this.popAction();
            this.log('POP ACTION ITEM', actionItem);
            if (actionItem !== null) {
                const action = this.createAction(actionItem);
                this.log('POP ACTION', action);
                if (action) {
                    await action.run(actionItem.args);
                }
            } else {
                const taskItem = this.popTask();
                this.log('POP TASK ITEM', taskItem);
                if (taskItem !== null) {
                    const task = this.createTask(taskItem);
                    this.log('POP TASK', task);
                    if (task !== null) {
                        task.run(taskItem.args);
                    }
                }
            }
        }
    }

    pushTask(task: QueueItem): void {
        this.log('PUSH TASK', task);
        this.taskQueue.push(task);
    }

    pushAction(action: QueueItem): void {
        this.log('PUSH ACTION', action);
        this.actionQueue.push(action);
    }

    private popTask() {
        const taskItem = this.taskQueue.pop();
        if (taskItem === null) {
            return null;
        }
        return taskItem;
    }

    private createTask(taskItem: QueueItem) {
        switch (taskItem.name) {
            case UpgradeBuildingTask.NAME:
                return new UpgradeBuildingTask(this);
        }
        this.log('UNKNOWN TASK', taskItem.name);
        return null;
    }

    private popAction() {
        const actionItem = this.actionQueue.pop();
        if (actionItem === null) {
            return null;
        }
        this.log('UNKNOWN ACTION', actionItem.name);
        return actionItem;
    }

    private createAction(actionItem: QueueItem) {
        if (actionItem.name === GoToBuildingAction.NAME) {
            return new GoToBuildingAction();
        }
        if (actionItem.name === UpgradeBuildingAction.NAME) {
            return new UpgradeBuildingAction();
        }
        return null;
    }

    private log(...args) {
        console.log('SCHEDULER', ...args);
    }
}
