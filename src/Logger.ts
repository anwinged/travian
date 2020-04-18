export abstract class Logger {
    abstract log(...args): void;
    abstract warn(...args): void;
    abstract error(...args): void;
}

export class NullLogger extends Logger {
    log(...args): void {}
    warn(...args): void {}
    error(...args): void {}
}

export class ConsoleLogger extends Logger {
    private readonly name: string;
    constructor(name: string) {
        super();
        this.name = name.toUpperCase();
    }

    log(...args): void {
        console.log(this.name + ':', ...args);
    }

    warn(...args): void {
        console.warn(this.name + ':', ...args);
    }

    error(...args): void {
        console.error(this.name + ':', ...args);
    }
}
