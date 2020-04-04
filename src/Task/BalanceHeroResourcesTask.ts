import { Args, Command } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { TrainTrooperAction } from '../Action/TrainTrooperAction';
import { GrabVillageResourcesAction } from '../Action/GrabVillageResourcesAction';
import { BalanceHeroResourcesAction } from '../Action/BalanceHeroResourcesAction';

@registerTask
export class BalanceHeroResourcesTask extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.cmd.args, taskId: task.id };
        this.scheduler.scheduleActions([
            new Command(GoToPageAction.name, { ...args, path: '/dorf1.php' }),
            new Command(GrabVillageResourcesAction.name, args),
            new Command(GoToPageAction.name, { ...args, path: 'hero.php' }),
            new Command(BalanceHeroResourcesAction.name, args),
            new Command(CompleteTaskAction.name, args),
        ]);
    }
}
