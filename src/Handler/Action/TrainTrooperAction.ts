import { BaseAction } from './BaseAction';
import { taskError, TryLaterError } from '../../Errors';
import { Args } from '../../Queue/Args';
import {
    clickTrainButton,
    fillTrainCount,
    getAvailableCount,
} from '../../Page/BuildingPage/TrooperPage';
import { TrainTroopTask } from '../Task/TrainTroopTask';
import { Resources } from '../../Core/Resources';
import { randomInRange } from '../../Helpers/Random';
import { aroundMinutes } from '../../Helpers/Time';
import { registerAction } from '../ActionMap';
import { Task } from '../../Queue/Task';

@registerAction
export class TrainTrooperAction extends BaseAction {
    async run(args: Args, task: Task): Promise<any> {
        const troopId = args.troopId || taskError('No troop id');
        const trainCount = args.count || taskError('No count');

        const availableCount = getAvailableCount(troopId);
        const desiredCount = randomInRange(3, 12);

        const readyToTrainCount = Math.min(trainCount, availableCount, desiredCount);
        const nextToTrainCount = trainCount - readyToTrainCount;

        if (readyToTrainCount <= 0) {
            throw new TryLaterError(aroundMinutes(15), 'No isReady to train troops');
        }

        if (nextToTrainCount > 0) {
            this.scheduleNextTask(task, nextToTrainCount);
        }

        fillTrainCount(troopId, readyToTrainCount);
        clickTrainButton();
    }

    private scheduleNextTask(prevTask: Task, nextToTrainCount: number) {
        const villageId = prevTask.args.villageId || taskError('Empty village id');
        const taskName = prevTask.name;
        const taskCollection = this.villageFactory.getById(villageId).taskCollection();
        taskCollection.addTaskAsFirst(taskName, {
            ...prevTask.args,
            count: nextToTrainCount,
        });
    }
}
