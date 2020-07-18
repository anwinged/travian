import { BuildBuildingAction } from '../Action/BuildBuildingAction';
import { GoToPageAction } from '../Action/GoToPageAction';
import { ActionDefinition, BaseTask } from './BaseTask';
import { path } from '../../Helpers/Path';
import { registerTask } from '../TaskMap';
import { taskError } from '../../Errors';
import { goToResourceViewPage } from '../ActionBundles';
import { ProductionQueue } from '../../Core/ProductionQueue';
import { Task } from '../../Queue/Task';

@registerTask({ queue: ProductionQueue.Building })
export class BuildBuildingTask extends BaseTask {
    defineActions(task: Task): Array<ActionDefinition> {
        const args = task.args;
        const villageId = args.villageId || taskError('No village id');

        return [
            goToResourceViewPage(villageId),
            {
                name: GoToPageAction.name,
                args: {
                    path: path('/build.php', {
                        newdid: args.villageId,
                        id: args.buildId,
                        category: args.categoryId,
                    }),
                },
            },
            {
                name: BuildBuildingAction.name,
            },
        ];
    }
}
