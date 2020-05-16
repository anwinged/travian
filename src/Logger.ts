import { timestamp } from './utils';

export interface Logger {
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}

export enum LogLevel {
    info = 3,
    warning = 2,
    error = 1,
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

export interface StorageLogRecord {
    level: string;
    ts: number;
    message: string;
}

export interface LogStorageInterface {
    write(record: StorageLogRecord): void;
}

export class StorageLogger implements Logger {
    private storage: LogStorageInterface;
    private readonly level: LogLevel;

    constructor(storage: LogStorageInterface, level: LogLevel) {
        this.storage = storage;
        this.level = level;
    }

    info(...args: any[]): void {
        if (this.level >= LogLevel.info) {
            this.storage.write({ level: 'info', message: args.join(' '), ts: timestamp() });
        }
    }

    warn(...args: any[]): void {
        if (this.level >= LogLevel.warning) {
            this.storage.write({ level: 'warn', message: args.join(' '), ts: timestamp() });
        }
    }

    error(...args: any[]): void {
        if (this.level >= LogLevel.error) {
            this.storage.write({ level: 'error', message: args.join(' '), ts: timestamp() });
        }
    }
}

export class AggregateLogger implements Logger {
    private readonly loggers: Array<Logger>;

    constructor(loggers: Array<Logger>) {
        this.loggers = loggers;
    }

    info(...args: any[]): void {
        for (let lg of this.loggers) {
            lg.info(...args);
        }
    }

    warn(...args: any[]): void {
        for (let lg of this.loggers) {
            lg.warn(...args);
        }
    }

    error(...args: any[]): void {
        for (let lg of this.loggers) {
            lg.error(...args);
        }
    }
}
