import { TaskController, registerTask, ActionDefinition } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { path } from '../utils';
import { Task } from '../Queue/TaskProvider';
import { ForgeImprovementAction } from '../Action/ForgeImprovementAction';

@registerTask
export class ForgeImprovementTask extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        const args = task.args;

        const pathArgs = {
            newdid: args.villageId,
            gid: args.buildTypeId || undefined,
            id: args.buildId || undefined,
        };

        return [[GoToPageAction.name, { ...args, path: path('/build.php', pathArgs) }], [ForgeImprovementAction.name]];
    }
}
