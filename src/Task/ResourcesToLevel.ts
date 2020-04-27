import { Args, Command } from '../Command';
import { Task } from '../Queue/TaskQueue';
import { TaskController, registerTask, ActionDefinition } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { path } from '../utils';
import { UpgradeResourceToLevel } from '../Action/UpgradeResourceToLevel';

@registerTask
export class ResourcesToLevel extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        return [
            [GoToPageAction.name, { path: path('/dorf1.php', { newdid: task.args.villageId }) }],
            [UpgradeResourceToLevel.name, {}],
        ];
    }
}
