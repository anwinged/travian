export class TryLaterError extends Error {
    readonly seconds: number;
    constructor(s: number) {
        super();
        this.seconds = s;
    }
}
