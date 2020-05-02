import { TaskController, registerTask, ActionDefinition } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { path } from '../utils';
import { UpgradeResourceToLevel } from '../Action/UpgradeResourceToLevel';
import { Task } from '../Queue/TaskProvider';

@registerTask
export class ResourcesToLevel extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        return [
            [GoToPageAction.name, { path: path('/dorf1.php', { newdid: task.args.villageId }) }],
            [UpgradeResourceToLevel.name],
        ];
    }
}
