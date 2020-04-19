import { TaskId } from './Queue/TaskQueue';

export class GrabError extends Error {
    constructor(msg: string = '') {
        super(msg);
        Object.setPrototypeOf(this, GrabError.prototype);
    }
}

export class ActionError extends Error {
    readonly taskId: TaskId;
    constructor(taskId: TaskId, msg: string = '') {
        super(msg);
        this.taskId = taskId;
        Object.setPrototypeOf(this, ActionError.prototype);
    }
}

export class AbortTaskError extends Error {
    readonly taskId: TaskId;
    constructor(taskId: TaskId, msg: string = '') {
        super(msg);
        this.taskId = taskId;
        Object.setPrototypeOf(this, AbortTaskError.prototype);
    }
}

export class TryLaterError extends Error {
    readonly seconds: number;
    readonly taskId: TaskId;

    constructor(taskId: TaskId, seconds: number, msg: string = '') {
        super(msg);
        this.taskId = taskId;
        this.seconds = seconds;
        Object.setPrototypeOf(this, TryLaterError.prototype);
    }
}
