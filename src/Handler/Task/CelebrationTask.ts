import { ActionDefinition, BaseTask } from './BaseTask';
import { GoToPageAction } from '../Action/GoToPageAction';
import { path } from '../../Helpers/Path';
import { CelebrationAction } from '../Action/CelebrationAction';
import { registerTask } from '../TaskMap';
import { ProductionQueue } from '../../Core/ProductionQueue';
import { Task } from '../../Queue/Task';

@registerTask({ queue: ProductionQueue.Celebration })
export class CelebrationTask extends BaseTask {
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
