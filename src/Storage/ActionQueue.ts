import { Command } from '../Common';
import { Logger } from '../Logger';

const QUEUE_NAME = 'action_queue:v2';

class State {
    items: Array<Command>;
    constructor(items: Array<Command>) {
        this.items = items;
    }

    pop(): Command | undefined {
        return this.items.shift();
    }

    push(cmd: Command) {
        this.items.push(cmd);
    }
}

export class ActionQueue {
    private readonly logger;

    constructor() {
        this.logger = new Logger(this.constructor.name);
    }

    pop(): Command | undefined {
        const state = this.getState();
        const first = state.pop();
        this.flushState(state);
        return first;
    }

    push(cmd: Command): void {
        const state = this.getState();
        state.push(cmd);
        this.flushState(state);
    }

    assign(items: Array<Command>): void {
        this.flushState(new State(items));
    }

    clear(): void {
        this.flushState(new State([]));
    }

    private getState(): State {
        const serialized = localStorage.getItem(QUEUE_NAME);
        if (serialized === null) {
            return new State([]);
        }

        let parsed = JSON.parse(serialized) as State;
        this.logger.log('STATE', parsed);

        return new State(parsed.items);
    }

    private flushState(state: State): void {
        localStorage.setItem(QUEUE_NAME, JSON.stringify(state));
    }
}
