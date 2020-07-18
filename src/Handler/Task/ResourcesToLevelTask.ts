import { BaseTask, ActionDefinition } from './BaseTask';
import { UpgradeResourceToLevelAction } from '../Action/UpgradeResourceToLevelAction';
import { Task } from '../../Queue/TaskProvider';
import { registerTask } from '../TaskMap';
import { goToResourceViewPage } from '../ActionBundles';
import { taskError } from '../../Errors';

@registerTask()
export class ResourcesToLevelTask extends BaseTask {
    defineActions(task: Task): Array<ActionDefinition> {
        const villageId = task.args.villageId || taskError('No village id');

        return [goToResourceViewPage(villageId), { name: UpgradeResourceToLevelAction.name }];
    }
}
