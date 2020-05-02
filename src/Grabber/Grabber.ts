import { Scheduler } from '../Scheduler';

export abstract class Grabber {
    protected scheduler: Scheduler;

    constructor(scheduler: Scheduler) {
        this.scheduler = scheduler;
    }

    abstract grab(): void;
}
