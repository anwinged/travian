import { ActionDefinition, TaskController } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { TrainTrooperAction } from '../Action/TrainTrooperAction';
import { Task } from '../Queue/TaskProvider';
import { path } from '../Helpers/Path';
import { registerTask, TaskType } from './TaskMap';

@registerTask({ type: TaskType.TrainUnit })
export class TrainTroopTask extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        const args = task.args;

        const pathArgs = {
            newdid: args.villageId,
            gid: args.buildTypeId || undefined,
            id: args.buildId || undefined,
            s: args.sheetId,
        };

        return [
            [GoToPageAction.name, { path: path('/build.php', pathArgs) }],
            [TrainTrooperAction.name],
            [CompleteTaskAction.name],
        ];
    }
}
