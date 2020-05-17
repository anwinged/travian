import { UpgradeBuildingAction } from '../Action/UpgradeBuildingAction';
import { TaskController, ActionDefinition } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { Task } from '../Queue/TaskProvider';
import { path } from '../Helpers/Path';
import { registerTask, TaskType } from './TaskMap';
import { goToResourceViewPage } from './ActionBundles';
import { taskError } from '../Errors';

@registerTask({ type: TaskType.Building })
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
