import { BaseTask, ActionDefinition } from './BaseTask';
import { UpgradeResourceToLevelAction } from '../Action/UpgradeResourceToLevelAction';
import { registerTask } from '../TaskMap';
import { goToResourceViewPage } from '../ActionBundles';
import { taskError } from '../../Errors';
import { Task } from '../../Queue/Task';

@registerTask()
export class ResourcesToLevelTask extends BaseTask {
    defineActions(task: Task): Array<ActionDefinition> {
        const villageId = task.args.villageId || taskError('No village id');

        return [goToResourceViewPage(villageId), { name: UpgradeResourceToLevelAction.name }];
    }
}
