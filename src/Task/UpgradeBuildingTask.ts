import { UpgradeBuildingAction } from '../Action/UpgradeBuildingAction';
import { TaskController, ActionDefinition } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { Task } from '../Queue/TaskProvider';
import { path } from '../Helpers/Path';
import { registerTask } from './TaskMap';
import { goToResourceViewPage } from './ActionBundles';
import { taskError } from '../Errors';
import { ProductionQueue } from '../Core/ProductionQueue';

@registerTask({ queue: ProductionQueue.Building })
export class UpgradeBuildingTask extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        const args = task.args;
        const villageId = args.villageId || taskError('No village id');

        return [
            goToResourceViewPage(villageId),
            [
                GoToPageAction.name,
                {
                    path: path('/build.php', { newdid: args.villageId, id: args.buildId }),
                },
            ],
            [UpgradeBuildingAction.name],
        ];
    }
}
