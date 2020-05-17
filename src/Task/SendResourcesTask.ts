import { TaskController, ActionDefinition } from './TaskController';
import { SendResourcesAction } from '../Action/SendResourcesAction';
import { ClickButtonAction } from '../Action/ClickButtonAction';
import { goToMarketSendResourcesPage, goToResourceViewPage } from './ActionBundles';
import { Task } from '../Queue/TaskProvider';
import { registerTask } from './TaskMap';
import { taskError } from '../Errors';

@registerTask()
export class SendResourcesTask extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        const targetVillageId = task.args.targetVillageId || taskError('Empty target village id');
        const villageId = task.args.villageId || taskError('Empty village id');

        return [
            goToResourceViewPage(targetVillageId),
            goToMarketSendResourcesPage(targetVillageId),
            goToResourceViewPage(villageId),
            goToMarketSendResourcesPage(villageId),
            [SendResourcesAction.name],
            [ClickButtonAction.name, { selector: '#enabledButton.green.sendRessources' }],
        ];
    }
}
