import { TaskController, ActionDefinition } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { Task } from '../Queue/TaskProvider';
import { path } from '../Helpers/Path';
import { CelebrationAction } from '../Action/CelebrationAction';
import { registerTask } from './TaskMap';
import { ProductionQueue } from '../Core/ProductionQueue';

@registerTask({ queue: ProductionQueue.Celebration })
export class CelebrationTask extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        const args = task.args;

        const pathArgs = {
            newdid: args.villageId,
            gid: args.buildTypeId || undefined,
            id: args.buildId || undefined,
        };

        return [
            [GoToPageAction.name, { path: path('/build.php', pathArgs) }],
            [CelebrationAction.name],
        ];
    }
}
