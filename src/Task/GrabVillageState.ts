import { Args, Command } from '../Command';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { GoToPageAction } from '../Action/GoToPageAction';
import { path } from '../utils';
import { Task } from '../Queue/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { grabVillageList } from '../Page/VillageBlock';
import { StoreVillageState } from '../Action/StoreVillageState';

@registerTask
export class GrabVillageState extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.args, taskId: task.id };

        const actions: Array<Command> = [];

        const villages = grabVillageList();
        for (let village of villages) {
            actions.push(
                new Command(GoToPageAction.name, {
                    ...args,
                    path: path('/dorf1.php', { newdid: village.id }),
                })
            );
            actions.push(new Command(StoreVillageState.name, args));
        }

        actions.push(new Command(CompleteTaskAction.name, args));

        this.scheduler.scheduleActions(actions);
    }
}
