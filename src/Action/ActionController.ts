import { Scheduler } from '../Scheduler';
import { AbortTaskError, TryLaterError } from '../Errors';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { aroundMinutes } from '../utils';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';
import { VillageStorage } from '../Storage/VillageStorage';
import { VillageStateRepository } from '../VillageState';

const actionMap: { [name: string]: Function | undefined } = {};

export function registerAction(constructor: Function) {
    actionMap[constructor.name] = constructor;
}

export function createActionHandler(
    name: string,
    scheduler: Scheduler,
    villageStateRepository: VillageStateRepository
): ActionController | undefined {
    const storedFunction = actionMap[name];
    if (storedFunction === undefined) {
        return undefined;
    }
    const constructor = (storedFunction as unknown) as typeof ActionController;
    return new constructor(scheduler, villageStateRepository);
}

export function taskError(msg: string): never {
    throw new AbortTaskError(msg);
}

export class ActionController {
    protected scheduler: Scheduler;
    protected villageStateRepository: VillageStateRepository;
    constructor(scheduler: Scheduler, villageStateRepository: VillageStateRepository) {
        this.scheduler = scheduler;
        this.villageStateRepository = villageStateRepository;
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
