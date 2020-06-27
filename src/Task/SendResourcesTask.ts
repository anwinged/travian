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

        actions.push({ name: FindSendResourcesPath.name });
        actions.push({ name: SendResourcesAction.name });
        actions.push({
            name: ClickButtonAction.name,
            args: { selector: '#enabledButton.green.sendRessources' },
        });

        return actions;
    }
}
