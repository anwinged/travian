import { TaskController, ActionDefinition } from './TaskController';
import { UpgradeResourceToLevel } from '../Action/UpgradeResourceToLevel';
import { Task } from '../Queue/TaskProvider';
import { registerTask } from './TaskMap';
import { goToResourceViewPage } from './ActionBundles';
import { taskError } from '../Errors';

@registerTask()
export class ResourcesToLevel extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        const villageId = task.args.villageId || taskError('No village id');

        return [goToResourceViewPage(villageId), [UpgradeResourceToLevel.name]];
    }
}
