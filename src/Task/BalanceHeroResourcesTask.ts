import { Args, Command } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { GrabVillageResourcesAction } from '../Action/GrabVillageResourcesAction';
import { BalanceHeroResourcesAction } from '../Action/BalanceHeroResourcesAction';
import { path } from '../utils';

@registerTask
export class BalanceHeroResourcesTask extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.args, taskId: task.id };
        this.scheduler.scheduleActions([
            new Command(GoToPageAction.name, {
                ...args,
                path: path('/dorf1.php'),
            }),
            new Command(GrabVillageResourcesAction.name, args),
            new Command(GoToPageAction.name, {
                ...args,
                path: path('/hero.php'),
            }),
            new Command(BalanceHeroResourcesAction.name, args),
            new Command(CompleteTaskAction.name, args),
        ]);
    }
}
