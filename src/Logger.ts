export interface Logger {
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}

export class NullLogger implements Logger {
    info(...args: any[]): void {}
    warn(...args: any[]): void {}
    error(...args: any[]): void {}
}

export class ConsoleLogger implements Logger {
    private readonly name: string;

    constructor(name: string) {
        this.name = name.toUpperCase();
    }

    info(...args: any[]): void {
        console.log(this.name + ':', ...args);
    }

    warn(...args: any[]): void {
        console.warn(this.name + ':', ...args);
    }

    error(...args: any[]): void {
        console.error(this.name + ':', ...args);
    }
}
