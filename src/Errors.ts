export class TryLaterError extends Error {
    readonly seconds: number;
    constructor(s: number, msg: string = '') {
        super(msg);
        this.seconds = s;
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, TryLaterError.prototype);
    }
}
