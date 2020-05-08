import { TaskController, ActionDefinition } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { Task } from '../Queue/TaskProvider';
import { ForgeImprovementAction } from '../Action/ForgeImprovementAction';
import { path } from '../Helpers/Path';
import { registerTask, TaskType } from './TaskMap';

@registerTask({ type: TaskType.UpgradeUnit })
export class ForgeImprovementTask extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        const args = task.args;

        const pathArgs = {
            newdid: args.villageId,
            gid: args.buildTypeId || undefined,
            id: args.buildId || undefined,
        };

        return [[GoToPageAction.name, { path: path('/build.php', pathArgs) }], [ForgeImprovementAction.name]];
    }
}
