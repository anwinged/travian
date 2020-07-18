import { BaseTask, ActionDefinition } from './BaseTask';
import { SendResourcesAction } from '../Action/SendResourcesAction';
import { ClickButtonAction } from '../Action/ClickButtonAction';
import { goToMarketSendResourcesPage, goToResourceViewPage } from '../ActionBundles';
import { Task } from '../../Queue/TaskProvider';
import { registerTask } from '../TaskMap';
import { FindSendResourcesPathAction } from '../Action/FindSendResourcesPathAction';

@registerTask()
export class SendResourcesTask extends BaseTask {
    defineActions(task: Task): Array<ActionDefinition> {
        const actions: Array<ActionDefinition> = [];

        const villages = this.factory.getAllVillages();
        for (let village of villages) {
            actions.push(goToResourceViewPage(village.id));
            actions.push(goToMarketSendResourcesPage(village.id));
        }

        actions.push({ name: FindSendResourcesPathAction.name });
        actions.push({ name: SendResourcesAction.name });
        actions.push({
            name: ClickButtonAction.name,
            args: { selector: '#enabledButton.green.sendRessources' },
        });

        return actions;
    }
}
