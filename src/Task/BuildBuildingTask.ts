import { BuildBuildingAction } from '../Action/BuildBuildingAction';
import { GoToPageAction } from '../Action/GoToPageAction';
import { path } from '../utils';
import { TaskController, registerTask, ActionDefinition } from './TaskController';
import { Task } from '../Queue/TaskProvider';

@registerTask
export class BuildBuildingTask extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        const args = task.args;
        return [
            [
                GoToPageAction.name,
                {
                    path: path('/dorf1.php', { newdid: args.villageId }),
                },
            ],
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
