import { UpgradeBuildingAction } from '../Action/UpgradeBuildingAction';
import { TaskController, registerTask, ActionDefinition } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { path } from '../utils';
import { Task } from '../Queue/TaskProvider';

@registerTask
export class UpgradeBuildingTask extends TaskController {
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
                    path: path('/build.php', { newdid: args.villageId, id: args.buildId }),
                },
            ],
            [UpgradeBuildingAction.name],
        ];
    }
}
