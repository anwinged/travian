import { Command } from '../Common';
import { ConsoleLogger, Logger } from '../Logger';
import { DataStorage } from './DataStorage';

const NAMESPACE = 'actions.v1';
const QUEUE_NAME = 'queue';

export type ActionList = Array<Command>;

export class ActionQueue {
    private storage: DataStorage;
    private readonly logger: Logger;

    constructor() {
        this.storage = new DataStorage(NAMESPACE);
        this.logger = new ConsoleLogger(this.constructor.name);
    }

    pop(): Command | undefined {
        const commands = this.getCommands();
        const first = commands.shift();
        this.flushState(commands);
        return first;
    }

    push(cmd: Command): void {
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

    private getCommands(): ActionList {
        const serialized = this.storage.get(QUEUE_NAME);
        if (!Array.isArray(serialized)) {
            return [];
        }

        const items = serialized as Array<{ [key: string]: any }>;

        return items.map(i => {
            const command = new Command('', {});
            return Object.assign(command, i);
        });
    }

    private flushState(commands: ActionList): void {
        this.storage.set(QUEUE_NAME, commands);
    }
}
