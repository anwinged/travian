import { Scheduler } from '../Scheduler';
import { VillageFactory } from '../Village/VillageFactory';
import { BaseAction } from './Action/BaseAction';

const actionMap: { [name: string]: Function | undefined } = {};

export function registerAction(constructor: Function) {
    actionMap[constructor.name] = constructor;
}

export function createActionHandler(
    name: string,
    scheduler: Scheduler,
    villageFactory: VillageFactory
): BaseAction | undefined {
    const storedFunction = actionMap[name];
    if (storedFunction === undefined) {
        return undefined;
    }
    const constructor = (storedFunction as unknown) as typeof BaseAction;
    return new constructor(scheduler, villageFactory);
}
