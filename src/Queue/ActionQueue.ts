import { ConsoleLogger, Logger } from '../Logger';
import { DataStorage } from '../Storage/DataStorage';
import { Action, ActionList, ImmutableActionList } from './Action';

const NAMESPACE = 'actions.v1';
const QUEUE_NAME = 'queue';

export class ActionQueue {
    private storage: DataStorage;
    private readonly logger: Logger;

    constructor() {
        this.storage = new DataStorage(NAMESPACE);
        this.logger = new ConsoleLogger(this.constructor.name);
    }

    pop(): Action | undefined {
        const actions = this.getActions();
        const first = actions.shift();
        this.flushState(actions);
        return first;
    }

    push(cmd: Action): void {
        const actions = this.getActions();
        actions.push(cmd);
        this.flushState(actions);
    }

    assign(actions: ActionList): void {
        this.flushState(actions);
    }

    clear(): void {
        this.flushState([]);
    }

    seeItems(): ImmutableActionList {
        return this.getActions();
    }

    private getActions(): ActionList {
        const serialized = this.storage.get(QUEUE_NAME);
        if (!Array.isArray(serialized)) {
            return [];
        }

        const items = serialized as Array<{ [key: string]: any }>;

        return items.map((i) => {
            const command = { name: '', args: {} };
            return Object.assign(command, i);
        });
    }

    private flushState(commands: ActionList): void {
        this.storage.set(QUEUE_NAME, commands);
    }
}
