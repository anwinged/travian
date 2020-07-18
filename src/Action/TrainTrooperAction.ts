import { ActionController, registerAction } from './ActionController';
import { taskError, TryLaterError } from '../Errors';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';
import {
    clickTrainButton,
    fillTrainCount,
    getAvailableCount,
} from '../Page/BuildingPage/TrooperPage';
import { TrainTroopTask } from '../Task/TrainTroopTask';
import { Resources } from '../Core/Resources';
import { randomInRange } from '../Helpers/Random';
import { aroundMinutes } from '../Helpers/Time';

@registerAction
export class TrainTrooperAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const troopId = args.troopId || taskError('No troop id');
        const trainCount = args.trainCount || taskError('No troop train count');
        const troopResources = args.troopResources || taskError('No troop resources');

        const availableCount = getAvailableCount(troopId);
        const desiredCount = randomInRange(3, 12);

        const readyToTrainCount = Math.min(availableCount, trainCount, desiredCount);
        const nextToTrainCount = trainCount - readyToTrainCount;

        if (readyToTrainCount <= 0) {
            throw new TryLaterError(aroundMinutes(15), 'No isReady to train troops');
        }

        if (nextToTrainCount > 0) {
            this.scheduler.scheduleTask(TrainTroopTask.name, {
                ...task.args,
                trainCount: nextToTrainCount,
                resources: Resources.fromObject(troopResources).scale(nextToTrainCount),
            });
        }

        fillTrainCount(troopId, readyToTrainCount);
        clickTrainButton();
    }
}
