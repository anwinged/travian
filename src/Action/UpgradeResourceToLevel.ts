import { ActionController, registerAction } from './ActionController';
import { Args } from '../Command';
import { ActionError, GrabError, TryLaterError } from '../Errors';
import { Task } from '../Queue/TaskQueue';
import { clickUpgradeButton } from '../Page/BuildingPage';
import { grabResourceDeposits } from '../Page/SlotBlock';
import { UpgradeBuildingTask } from '../Task/UpgradeBuildingTask';
import { ResourceDeposit } from '../Game';
import { aroundMinutes } from '../utils';

@registerAction
export class UpgradeResourceToLevel extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const deposits = grabResourceDeposits();
        if (deposits.length === 0) {
            throw new ActionError(task.id, 'No deposits');
        }

        const villageId = args.villageId;
        const requiredLevel = args.level;
        const tasks = this.scheduler.getTaskItems();

        const allUpgraded = deposits.reduce((memo, dep) => memo && dep.level >= requiredLevel, true);

        if (allUpgraded) {
            this.scheduler.completeTask(task.id);
            return;
        }

        const isDepositTaskNotInQueue = (dep: ResourceDeposit) =>
            undefined ===
            tasks.find(
                task =>
                    task.name === UpgradeBuildingTask.name &&
                    task.args.villageId === villageId &&
                    task.args.buildId === dep.buildId
            );

        const notUpgraded = deposits.sort((x, y) => x.level - y.level).filter(isDepositTaskNotInQueue);

        if (notUpgraded.length === 0) {
            throw new TryLaterError(task.id, aroundMinutes(10), 'No available deposits');
        }

        for (let dep of notUpgraded) {
            this.scheduler.scheduleTask(UpgradeBuildingTask.name, { villageId, buildId: dep.buildId });
        }

        throw new TryLaterError(task.id, aroundMinutes(10), 'Sleep for next round');
    }
}
