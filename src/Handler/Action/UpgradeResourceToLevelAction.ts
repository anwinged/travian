import { BaseAction } from './BaseAction';
import { ActionError, taskError, TryLaterError } from '../../Errors';
import { grabResourceSlots } from '../../Page/SlotBlock';
import { UpgradeBuildingTask } from '../Task/UpgradeBuildingTask';
import { Args } from '../../Queue/Args';
import { Task } from '../../Queue/TaskProvider';
import { ResourceSlot } from '../../Core/Slot';
import { getNumber } from '../../Helpers/Convert';
import { aroundMinutes } from '../../Helpers/Time';
import { registerAction } from '../ActionMap';

@registerAction
export class UpgradeResourceToLevelAction extends BaseAction {
    async run(args: Args, task: Task): Promise<any> {
        const deposits = grabResourceSlots();
        if (deposits.length === 0) {
            throw new ActionError('No deposits');
        }

        const villageId = args.villageId || taskError('No village id');

        const requiredLevel = getNumber(args.level);

        const notUpgraded = deposits.filter(
            dep => !dep.isUnderConstruction && requiredLevel > dep.level
        );

        if (notUpgraded.length === 0) {
            this.scheduler.removeTask(task.id);
            return;
        }

        notUpgraded.sort((x, y) => x.level - y.level);

        // Next two buildings: no delay between start building and scheduling next

        const firstNotUpgraded = notUpgraded.shift();
        const secondNotUpgraded = notUpgraded.shift();

        if (firstNotUpgraded && this.isTaskNotInQueue(villageId, firstNotUpgraded)) {
            this.scheduler.scheduleTask(UpgradeBuildingTask.name, {
                villageId,
                buildId: firstNotUpgraded.buildId,
            });
        }

        if (secondNotUpgraded && this.isTaskNotInQueue(villageId, secondNotUpgraded)) {
            this.scheduler.scheduleTask(UpgradeBuildingTask.name, {
                villageId,
                buildId: secondNotUpgraded.buildId,
            });
        }

        throw new TryLaterError(aroundMinutes(10), 'Sleep for next round');
    }

    private isTaskNotInQueue(villageId: number, dep: ResourceSlot): boolean {
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
