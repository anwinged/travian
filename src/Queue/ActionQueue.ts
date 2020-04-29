import { ConsoleLogger, Logger } from '../Logger';
import { DataStorage } from '../DataStorage';
import { Args } from './Args';

const NAMESPACE = 'actions.v1';
const QUEUE_NAME = 'queue';

export class Action {
    readonly name: string;
    readonly args: Args;

    constructor(name: string, args: Args) {
        this.name = name;
        this.args = args;
    }
}

type ActionList = Array<Action>;

export type ImmutableActionList = ReadonlyArray<Action>;

export class ActionQueue {
    private storage: DataStorage;
    private readonly logger: Logger;

    constructor() {
        this.storage = new DataStorage(NAMESPACE);
        this.logger = new ConsoleLogger(this.constructor.name);
    }

    pop(): Action | undefined {
        const commands = this.getCommands();
        const first = commands.shift();
        this.flushState(commands);
        return first;
    }

    push(cmd: Action): void {
        const commands = this.getCommands();
        commands.push(cmd);
        this.flushState(commands);
    }

    assign(commands: ActionList): void {
        this.flushState(commands);
    }

    clear(): void {
        this.flushState([]);
    }

    seeItems(): ImmutableActionList {
        return this.getCommands();
    }

    private getCommands(): ActionList {
        const serialized = this.storage.get(QUEUE_NAME);
        if (!Array.isArray(serialized)) {
            return [];
        }

        const items = serialized as Array<{ [key: string]: any }>;

        return items.map(i => {
            const command = new Action('', {});
            return Object.assign(command, i);
        });
    }

    private flushState(commands: ActionList): void {
        this.storage.set(QUEUE_NAME, commands);
    }
}
