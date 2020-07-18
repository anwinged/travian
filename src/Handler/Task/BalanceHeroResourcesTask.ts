import { ActionDefinition, BaseTask } from './BaseTask';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { BalanceHeroResourcesAction } from '../Action/BalanceHeroResourcesAction';
import { GoToHeroVillageAction } from '../Action/GoToHeroVillageAction';
import { Task } from '../../Queue/TaskProvider';
import { path } from '../../Helpers/Path';
import { registerTask } from '../TaskMap';

@registerTask()
export class BalanceHeroResourcesTask extends BaseTask {
    defineActions(task: Task): Array<ActionDefinition> {
        return [
            {
                name: GoToPageAction.name,
                args: {
                    path: path('/hero.php'),
                },
            },
            { name: GoToHeroVillageAction.name },
            { name: BalanceHeroResourcesAction.name },
        ];
    }
}
