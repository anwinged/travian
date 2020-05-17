import { ActionController, registerAction } from './ActionController';
import { AbortTaskError, ActionError, taskError, TryLaterError } from '../Errors';
import { grabResourceDeposits } from '../Page/SlotBlock';
import { UpgradeBuildingTask } from '../Task/UpgradeBuildingTask';
import { ResourceDeposit } from '../Game';
import { aroundMinutes, getNumber } from '../utils';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';

@registerAction
export class UpgradeResourceToLevel extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const deposits = grabResourceDeposits();
        if (deposits.length === 0) {
            throw new ActionError('No deposits');
        }

        const villageId = args.villageId || taskError('No village id');

        const requiredLevel = getNumber(args.level);

        const notUpgraded = deposits.filter(dep => !dep.underConstruction && requiredLevel > dep.level);

        if (notUpgraded.length === 0) {
            this.scheduler.removeTask(task.id);
            return;
        }

        notUpgraded.sort((x, y) => x.level - y.level);

        // Next two buildings: no delay between start building and scheduling next

        const firstNotUpgraded = notUpgraded.shift();
        const secondNotUpgraded = notUpgraded.shift();

        if (firstNotUpgraded && this.isTaskNotInQueue(villageId, firstNotUpgraded)) {
            this.scheduler.scheduleTask(UpgradeBuildingTask.name, { villageId, buildId: firstNotUpgraded.buildId });
        }

        if (secondNotUpgraded && this.isTaskNotInQueue(villageId, secondNotUpgraded)) {
            this.scheduler.scheduleTask(UpgradeBuildingTask.name, { villageId, buildId: secondNotUpgraded.buildId });
        }

        throw new TryLaterError(aroundMinutes(10), 'Sleep for next round');
    }

    private isTaskNotInQueue(villageId: number, dep: ResourceDeposit): boolean {
        const tasks = this.scheduler.getTaskItems();
        return (
            undefined ===
            tasks.find(
                task =>
                    task.name === UpgradeBuildingTask.name &&
                    task.args.villageId === villageId &&
                    task.args.buildId === dep.buildId
            )
        );
    }
}
