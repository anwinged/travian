import { ActionDefinition, BaseTask } from './BaseTask';
import { GoToPageAction } from '../Action/GoToPageAction';
import { TrainTrooperAction } from '../Action/TrainTrooperAction';
import { Task } from '../../Queue/TaskProvider';
import { path } from '../../Helpers/Path';
import { registerTask } from '../TaskMap';
import { ProductionQueue } from '../../Core/ProductionQueue';

@registerTask({ queue: ProductionQueue.TrainUnit })
export class TrainTroopTask extends BaseTask {
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
                        s: args.sheetId,
                    }),
                },
            },
            { name: TrainTrooperAction.name },
        ];
    }
}
