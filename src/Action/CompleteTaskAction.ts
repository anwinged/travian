import ActionController from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import Scheduler from '../Scheduler';

export default class CompleteTaskAction extends ActionController {
    static NAME = 'complete_task';
    private scheduler: Scheduler;

    constructor(scheduler: Scheduler) {
        super();
        this.scheduler = scheduler;
    }
    async run(args: Args, task: Task): Promise<any> {
        this.scheduler.completeTask(task.id);
    }
}
