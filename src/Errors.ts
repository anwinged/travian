export class GrabError extends Error {
    constructor(msg: string = '') {
        super(msg);
        Object.setPrototypeOf(this, GrabError.prototype);
    }
}

export class ActionError extends Error {
    constructor(msg: string = '') {
        super(msg);
        Object.setPrototypeOf(this, ActionError.prototype);
    }
}

export class AbortTaskError extends Error {
    constructor(msg: string = '') {
        super(msg);
        Object.setPrototypeOf(this, AbortTaskError.prototype);
    }
}

export class TryLaterError extends Error {
    readonly seconds: number;

    constructor(seconds: number, msg: string = '') {
        super(msg);
        this.seconds = seconds;
        Object.setPrototypeOf(this, TryLaterError.prototype);
    }
}
