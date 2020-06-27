import { ActionDefinition, TaskController } from './TaskController';
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

        return [
            {
                name: GoToPageAction.name,
                args: {
                    path: path('/build.php', {
                        newdid: args.villageId,
                        gid: args.buildTypeId,
                        id: args.buildId,
                    }),
                },
            },
            { name: CelebrationAction.name },
        ];
    }
}
