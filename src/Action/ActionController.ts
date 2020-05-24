import { Scheduler } from '../Scheduler';
import { taskError, TryLaterError } from '../Errors';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { aroundMinutes } from '../utils';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';
import { VillageStorage } from '../Storage/VillageStorage';
import { VillageFactory } from '../VillageFactory';

const actionMap: { [name: string]: Function | undefined } = {};

export function registerAction(constructor: Function) {
    actionMap[constructor.name] = constructor;
}

export function createActionHandler(
    name: string,
    scheduler: Scheduler,
    villageFactory: VillageFactory
): ActionController | undefined {
    const storedFunction = actionMap[name];
    if (storedFunction === undefined) {
        return undefined;
    }
    const constructor = (storedFunction as unknown) as typeof ActionController;
    return new constructor(scheduler, villageFactory);
}

export class ActionController {
    protected readonly scheduler: Scheduler;
    protected readonly villageFactory: VillageFactory;
    constructor(scheduler: Scheduler, villageFactory: VillageFactory) {
        this.scheduler = scheduler;
        this.villageFactory = villageFactory;
    }

    async run(args: Args, task: Task) {}

    ensureSameVillage(args: Args, task: Task) {
        let villageId = args.villageId || taskError('Undefined village id');
        const activeVillageId = grabActiveVillageId();
        if (villageId !== activeVillageId) {
            throw new TryLaterError(aroundMinutes(1), 'Not same village');
        }
    }

    ensureBuildingQueueIsEmpty() {
        const storage = new VillageStorage(grabActiveVillageId());
        const info = storage.getBuildingQueueInfo();
        if (info.seconds > 0) {
            throw new TryLaterError(info.seconds + 1, 'Building queue is full');
        }
    }
}
