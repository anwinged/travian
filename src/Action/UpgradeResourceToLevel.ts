import { ActionController, registerAction } from './ActionController';
import { Args } from '../Command';
import { AbortTaskError, ActionError, TryLaterError } from '../Errors';
import { Task } from '../Queue/TaskQueue';
import { grabResourceDeposits } from '../Page/SlotBlock';
import { UpgradeBuildingTask } from '../Task/UpgradeBuildingTask';
import { ResourceDeposit } from '../Game';
import { aroundMinutes, getNumber } from '../utils';

@registerAction
export class UpgradeResourceToLevel extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const deposits = grabResourceDeposits();
        if (deposits.length === 0) {
            throw new ActionError('No deposits');
        }

        const villageId = args.villageId;
        if (villageId === undefined) {
            throw new AbortTaskError('No village id');
        }

        const requiredLevel = getNumber(args.level);

        const notUpgraded = deposits.filter(dep => requiredLevel > dep.level);

        if (notUpgraded.length === 0) {
            this.scheduler.removeTask(task.id);
            return;
        }

        const firstNotUpgraded = notUpgraded.sort((x, y) => x.level - y.level).shift();

        if (firstNotUpgraded && this.isTaskNotInQueue(villageId, firstNotUpgraded)) {
            this.scheduler.scheduleTask(UpgradeBuildingTask.name, { villageId, buildId: firstNotUpgraded.buildId });
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
