import { sleep } from './utils';
import { Queue } from './Queue';
import GoToMainAction from './Action/GoToMainAction';

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
        while (true) {
            const action = this.popAction();
            console.log('POP ACTION', action);
            if (action !== null) {
                await action.run();
            } else {
                const task = this.popTask();
                console.log('POP TASK', task);
                if (task !== null) {
                    // do task
                }
            }
            const waitTime = Math.random() * 5000;
            console.log('WAIT', waitTime);
            await sleep(waitTime);
        }
    }

    private popTask() {
        const item = this.taskQueue.pop();
        if (item === null) {
            return null;
        }
        return null;
    }

    private popAction() {
        const item = this.actionQueue.pop();
        if (item === null) {
            return null;
        }
        if (item.name === 'go_to_main') {
            return new GoToMainAction();
        }
        return null;
    }
}
