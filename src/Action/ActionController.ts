import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { GameState } from '../Storage/GameState';
import Scheduler from '../Scheduler';

const actionMap: { [name: string]: Function | undefined } = {};

export function registerAction(constructor: Function) {
    console.log('REGISTER ACTION', constructor.name);
    actionMap[constructor.name] = constructor;
}

export function createAction(
    name: string,
    state: GameState,
    scheduler: Scheduler
): ActionController | undefined {
    const storedFunction = actionMap[name];
    if (storedFunction === undefined) {
        return undefined;
    }
    const constructor = (storedFunction as unknown) as typeof ActionController;
    return new constructor(state, scheduler);
}

export class ActionController {
    protected state: GameState;
    protected scheduler: Scheduler;
    constructor(state: GameState, scheduler: Scheduler) {
        this.state = state;
        this.scheduler = scheduler;
    }

    async run(args: Args, task: Task) {}
}
