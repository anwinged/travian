import { ActionDefinition, TaskController } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { SendOnAdventureAction } from '../Action/SendOnAdventureAction';
import { ClickButtonAction } from '../Action/ClickButtonAction';
import { Task } from '../Queue/TaskProvider';
import { path } from '../Helpers/Path';
import { registerTask } from './TaskMap';

@registerTask()
export class SendOnAdventureTask extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        return [
            {
                name: GoToPageAction.name,
                args: {
                    path: path('/hero.php'),
                },
            },
            {
                name: GoToPageAction.name,
                args: {
                    path: path('/hero.php', { t: 3 }),
                },
            },
            { name: SendOnAdventureAction.name },
            {
                name: ClickButtonAction.name,
                args: {
                    selector: '.adventureSendButton button',
                },
            },
        ];
    }
}
