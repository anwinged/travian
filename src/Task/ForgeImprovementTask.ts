import { ActionDefinition, TaskController } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { Task } from '../Queue/TaskProvider';
import { ForgeImprovementAction } from '../Action/ForgeImprovementAction';
import { path } from '../Helpers/Path';
import { registerTask } from './TaskMap';
import { ProductionQueue } from '../Core/ProductionQueue';

@registerTask({ queue: ProductionQueue.UpgradeUnit })
export class ForgeImprovementTask extends TaskController {
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
            { name: ForgeImprovementAction.name },
        ];
    }
}
