export class Logger {
    private readonly name: string;
    constructor(name: string) {
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

    makeLogger(name: string) {
        return new Logger(this.name + '.' + name);
    }
}
