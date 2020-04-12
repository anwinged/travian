import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { ActionError, GrabError, TryLaterError } from '../Errors';
import { Task } from '../Storage/TaskQueue';
import { clickUpgradeButton } from '../Page/BuildingPage';
import { grabResourceDeposits } from '../Page/SlotBlock';
import { UpgradeBuildingTask } from '../Task/UpgradeBuildingTask';
import { ResourceDeposit } from '../Game';

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

        const available = deposits
            .sort((x, y) => x.level - y.level)
            .filter(dep => dep.ready)
            .filter(isDepositTaskNotInQueue);

        if (available.length === 0) {
            throw new TryLaterError(task.id, 10 * 60, 'No available deposits');
        }

        const targetDep = available[0];

        this.scheduler.scheduleTask(UpgradeBuildingTask.name, { villageId, buildId: targetDep.buildId });

        throw new TryLaterError(task.id, 20 * 60, 'Sleep for next round');
    }
}
