import { BuildBuildingAction } from '../Action/BuildBuildingAction';
import { GoToPageAction } from '../Action/GoToPageAction';
import { ActionDefinition, TaskController } from './TaskController';
import { Task } from '../Queue/TaskProvider';
import { path } from '../Helpers/Path';
import { registerTask, TaskType } from './TaskMap';
import { taskError } from '../Errors';
import { goToResourceViewPage } from './ActionBundles';

@registerTask({ type: TaskType.Building })
export class BuildBuildingTask extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        const args = task.args;
        const villageId = args.villageId || taskError('No village id');

        return [
            goToResourceViewPage(villageId),
            [
                GoToPageAction.name,
                {
                    path: path('/build.php', { newdid: args.villageId, id: args.buildId, category: args.categoryId }),
                },
            ],
            [BuildBuildingAction.name],
        ];
    }
}
