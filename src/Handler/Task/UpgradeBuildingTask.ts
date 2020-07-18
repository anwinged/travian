import { UpgradeBuildingAction } from '../Action/UpgradeBuildingAction';
import { BaseTask, ActionDefinition } from './BaseTask';
import { GoToPageAction } from '../Action/GoToPageAction';
import { Task } from '../../Queue/TaskProvider';
import { path } from '../../Helpers/Path';
import { registerTask } from '../TaskMap';
import { goToResourceViewPage } from '../ActionBundles';
import { taskError } from '../../Errors';
import { ProductionQueue } from '../../Core/ProductionQueue';

@registerTask({ queue: ProductionQueue.Building })
export class UpgradeBuildingTask extends BaseTask {
    defineActions(task: Task): Array<ActionDefinition> {
        const args = task.args;
        const villageId = args.villageId || taskError('No village id');

        return [
            goToResourceViewPage(villageId),
            {
                name: GoToPageAction.name,
                args: {
                    path: path('/build.php', { newdid: args.villageId, id: args.buildId }),
                },
            },
            { name: UpgradeBuildingAction.name },
        ];
    }
}
