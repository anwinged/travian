import { Args, Command } from '../Command';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { GoToPageAction } from '../Action/GoToPageAction';
import { path } from '../utils';
import { Task } from '../Queue/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { grabVillageList } from '../Page/VillageBlock';
import { MARKET_ID } from '../Core/Buildings';

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
            actions.push(
                new Command(GoToPageAction.name, {
                    ...args,
                    path: path('/build.php', { newdid: village.id, gid: MARKET_ID, t: 5 }),
                })
            );
        }

        actions.push(new Command(CompleteTaskAction.name, args));

        this.scheduler.scheduleActions(actions);
    }
}
