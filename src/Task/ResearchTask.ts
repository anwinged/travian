import { TaskController, registerTask, ActionDefinition } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { TrainTrooperAction } from '../Action/TrainTrooperAction';
import { path } from '../utils';
import { Action } from '../Queue/ActionQueue';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';
import { ResearchAction } from '../Action/ResearchAction';

@registerTask
export class ResearchTask extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        const args = task.args;

        const pathArgs = {
            newdid: args.villageId,
            gid: args.buildTypeId || undefined,
            id: args.buildId || undefined,
        };

        return [[GoToPageAction.name, { ...args, path: path('/build.php', pathArgs) }], [ResearchAction.name]];
    }
}
