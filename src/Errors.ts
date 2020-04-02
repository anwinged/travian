import { TaskId } from './Storage/TaskQueue';

export class ActionError extends Error {
    readonly id: TaskId;
    constructor(id: TaskId, msg: string = '') {
        super(msg);
        this.id = id;
        Object.setPrototypeOf(this, ActionError.prototype);
    }
}

export class AbortTaskError extends Error {
    readonly id: TaskId;
    constructor(id: TaskId, msg: string = '') {
        super(msg);
        this.id = id;
        Object.setPrototypeOf(this, AbortTaskError.prototype);
    }
}

export class TryLaterError extends Error {
    readonly seconds: number;
    readonly id: TaskId;
    constructor(seconds: number, id: TaskId, msg: string = '') {
        super(msg);
        this.id = id;
        this.seconds = seconds;
        Object.setPrototypeOf(this, TryLaterError.prototype);
    }
}

export class BuildingQueueFullError extends Error {
    readonly seconds: number;
    readonly id: TaskId;
    constructor(seconds: number, id: TaskId, msg: string = '') {
        super(msg);
        this.id = id;
        this.seconds = seconds;
        Object.setPrototypeOf(this, BuildingQueueFullError.prototype);
    }
}
