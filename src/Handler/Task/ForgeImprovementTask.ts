import { ActionDefinition, BaseTask } from './BaseTask';
import { GoToPageAction } from '../Action/GoToPageAction';
import { ForgeImprovementAction } from '../Action/ForgeImprovementAction';
import { path } from '../../Helpers/Path';
import { registerTask } from '../TaskMap';
import { ProductionQueue } from '../../Core/ProductionQueue';
import { Task } from '../../Queue/Task';

@registerTask({ queue: ProductionQueue.UpgradeUnit })
export class ForgeImprovementTask extends BaseTask {
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
