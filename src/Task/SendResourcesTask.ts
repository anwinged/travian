import { TaskController, registerTask, ActionDefinition } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { SendResourcesAction } from '../Action/SendResourcesAction';
import { ClickButtonAction } from '../Action/ClickButtonAction';
import { scanAllVillagesBundle } from './ActionBundles';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';
import { path } from '../Helpers/Path';

@registerTask
export class SendResourcesTask extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        return [...scanAllVillagesBundle(), ...this.sendResourcesActions(task.args)];
    }

    sendResourcesActions(args: Args): Array<ActionDefinition> {
        const pathArgs = {
            newdid: args.villageId,
            gid: args.buildTypeId || undefined,
            id: args.buildId || undefined,
            t: args.tabId,
        };

        const pagePath = path('/build.php', pathArgs);

        return [
            [GoToPageAction.name, { path: pagePath }],
            [SendResourcesAction.name],
            [ClickButtonAction.name, { selector: '#enabledButton.green.sendRessources' }],
            [CompleteTaskAction.name],
        ];
    }
}
