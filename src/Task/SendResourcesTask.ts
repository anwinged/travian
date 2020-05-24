import { TaskController, ActionDefinition } from './TaskController';
import { SendResourcesAction } from '../Action/SendResourcesAction';
import { ClickButtonAction } from '../Action/ClickButtonAction';
import { goToMarketSendResourcesPage, goToResourceViewPage } from './ActionBundles';
import { Task } from '../Queue/TaskProvider';
import { registerTask } from './TaskMap';
import { FindSendResourcesPath } from '../Action/FindSendResourcesPath';

@registerTask()
export class SendResourcesTask extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        const actions: Array<ActionDefinition> = [];

        const villages = this.factory.getAllVillages();
        for (let village of villages) {
            actions.push(goToResourceViewPage(village.id));
            actions.push(goToMarketSendResourcesPage(village.id));
        }

        actions.push([FindSendResourcesPath.name]);
        actions.push([SendResourcesAction.name]);
        actions.push([ClickButtonAction.name, { selector: '#enabledButton.green.sendRessources' }]);

        return actions;
    }
}
