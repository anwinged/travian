import { ActionController, err, registerAction } from './ActionController';
import { TryLaterError } from '../Errors';
import { aroundMinutes } from '../utils';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';
import { clickTrainButton, fillTrainCount, getAvailableCount } from '../Page/BuildingPage/TrooperPage';
import { TrainTroopTask } from '../Task/TrainTroopTask';

@registerAction
export class TrainTrooperAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const troopId = args.troopId || err('No troop id');
        const trainCount = args.trainCount || err('No troop train count');

        const availableCount = getAvailableCount(troopId);

        const readyToTrainCount = Math.min(availableCount, trainCount);
        const nextToTrainCount = trainCount - readyToTrainCount;

        if (readyToTrainCount <= 0) {
            throw new TryLaterError(aroundMinutes(15), 'No ready to train troops');
        }

        if (nextToTrainCount > 0) {
            this.scheduler.scheduleTask(TrainTroopTask.name, { ...task.args, trainCount: nextToTrainCount });
        }

        fillTrainCount(troopId, readyToTrainCount);
        clickTrainButton();
    }
}
