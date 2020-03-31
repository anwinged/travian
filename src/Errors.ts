import { TaskId } from './Storage/TaskQueue';

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
