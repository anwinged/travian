import { Command } from '../Common';

const QUEUE_NAME = 'task_queue:v2';

class CommandWithTime {
    readonly cmd: Command;
    readonly ts: number;
    constructor(cmd: Command, ts: number) {
        this.cmd = cmd;
        this.ts = ts;
    }
}

export class State {
    current: CommandWithTime | null;
    items: Array<CommandWithTime>;
    constructor(
        current: CommandWithTime | null,
        items: Array<CommandWithTime>
    ) {
        items.sort((x: CommandWithTime, y: CommandWithTime) => x.ts - y.ts);
        this.current = current;
        this.items = items;
    }

    push(cmd: Command, ts: number): State {
        const items = this.items.slice();
        items.push(new CommandWithTime(cmd, ts));
        return new State(this.current, items);
    }

    next(): State {
        const items = this.items.slice();
        const first = items.shift();
        if (first === undefined) {
            return new State(null, []);
        }
        return new State(first, items);
    }

    postpone(ds: number): State {
        const current = this.current;
        let items = this.items.slice();
        if (current) {
            const cmd = new CommandWithTime(current.cmd, current.ts + ds);
            items.push(cmd);
        }
        return new State(null, items);
    }
}

export class ImmutableState {
    readonly current: CommandWithTime | null;
    readonly items: Array<CommandWithTime>;
    constructor(state: State) {
        this.current = state.current;
        this.items = state.items;
    }
}

export class TaskQueue {
    push(cmd: Command, ts: number | null = null) {
        this.log('PUSH TASK', cmd, ts);
        const state = this.getState();
        this.flushState(state.push(cmd, ts || this.defaultTs()));
    }

    current(): Command | null {
        let current = this.getState().current;
        return current ? current.cmd : null;
    }

    next(): Command | null {
        let state = this.getState().next();
        let current = state.current ? state.current.cmd : null;
        this.flushState(state);
        return current;
    }

    postpone(ds: number) {
        const state = this.getState().postpone(ds);
        this.flushState(state);
    }

    state(): ImmutableState {
        return new ImmutableState(this.getState());
    }

    private defaultTs(): number {
        return Math.floor(Date.now() / 1000);
    }

    private getState(): State {
        const serialized = localStorage.getItem(QUEUE_NAME);
        if (serialized === null) {
            return new State(null, []);
        }

        const s = JSON.parse(serialized) as State;

        this.log('STATE', s);

        return new State(s.current, s.items);
    }

    private flushState(state: State): void {
        localStorage.setItem(QUEUE_NAME, JSON.stringify(state));
    }

    private log(...args) {
        console.log('TASK QUEUE:', ...args);
    }
}
