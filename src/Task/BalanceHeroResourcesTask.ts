import { Task } from '../Queue/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { BalanceHeroResourcesAction } from '../Action/BalanceHeroResourcesAction';
import { path } from '../utils';
import { GoToHeroVillageAction } from '../Action/GoToHeroVillageAction';
import { Action } from '../Queue/ActionQueue';
import { Args } from '../Queue/Args';

@registerTask
export class BalanceHeroResourcesTask extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.args, taskId: task.id };
        this.scheduler.scheduleActions([
            new Action(GoToPageAction.name, {
                ...args,
                path: path('/hero.php'),
            }),
            new Action(GoToHeroVillageAction.name, args),
            new Action(BalanceHeroResourcesAction.name, args),
            new Action(CompleteTaskAction.name, args),
        ]);
    }
}
