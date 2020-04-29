import { Args } from '../Command';
import { Task } from '../Queue/TaskQueue';
import { Scheduler } from '../Scheduler';
import { ActionError, TryLaterError } from '../Errors';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { aroundMinutes } from '../utils';

const actionMap: { [name: string]: Function | undefined } = {};

export function registerAction(constructor: Function) {
    actionMap[constructor.name] = constructor;
}

export function createActionHandler(name: string, scheduler: Scheduler): ActionController | undefined {
    const storedFunction = actionMap[name];
    if (storedFunction === undefined) {
        return undefined;
    }
    const constructor = (storedFunction as unknown) as typeof ActionController;
    return new constructor(scheduler);
}

export class ActionController {
    protected scheduler: Scheduler;
    constructor(scheduler: Scheduler) {
        this.scheduler = scheduler;
    }

    async run(args: Args, task: Task) {}

    ensureSameVillage(args: Args, task: Task) {
        let villageId = args.villageId;
        if (villageId === undefined) {
            throw new ActionError('Undefined village id');
        }

        const activeVillageId = grabActiveVillageId();
        if (villageId !== activeVillageId) {
            throw new TryLaterError(aroundMinutes(1), 'Not same village');
        }
    }
}
