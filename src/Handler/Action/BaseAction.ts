import { Scheduler } from '../../Scheduler';
import { taskError, TryLaterError } from '../../Errors';
import { grabActiveVillageId } from '../../Page/VillageBlock';
import { Args } from '../../Queue/Args';
import { VillageFactory } from '../../Village/VillageFactory';
import { aroundMinutes } from '../../Helpers/Time';
import { Task } from '../../Queue/Task';

export class BaseAction {
    protected readonly scheduler: Scheduler;
    protected readonly villageFactory: VillageFactory;
    constructor(scheduler: Scheduler, villageFactory: VillageFactory) {
        this.scheduler = scheduler;
        this.villageFactory = villageFactory;
    }

    async run(args: Args, task: Task) {}

    ensureSameVillage(args: Args) {
        let villageId = args.villageId || taskError('Undefined village id');
        const activeVillageId = grabActiveVillageId();
        if (villageId !== activeVillageId) {
            throw new TryLaterError(aroundMinutes(1), 'Not same village');
        }
    }
}
