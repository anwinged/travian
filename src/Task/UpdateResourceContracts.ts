import { Args, Command } from '../Command';
import { Task } from '../Queue/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { path } from '../utils';
import { UpgradeBuildingTask } from './UpgradeBuildingTask';
import { UpdateBuildingTaskResourcesAction } from '../Action/UpdateBuildingTaskResourcesAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';

@registerTask
export class UpdateResourceContracts extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.args, taskId: task.id };

        const actions: Array<Command> = [];

        const tasks = this.scheduler.getTaskItems();
        for (let task of tasks) {
            const { villageId, buildId } = task.args;
            if (task.name === UpgradeBuildingTask.name && villageId && buildId) {
                actions.push(
                    new Command(GoToPageAction.name, {
                        ...args,
                        path: path('/build.php', { newdid: villageId, id: buildId }),
                    })
                );
                actions.push(new Command(UpdateBuildingTaskResourcesAction.name, { ...args, taskId: task.id }));
            }
        }

        actions.push(new Command(CompleteTaskAction.name, args));

        this.scheduler.scheduleActions(actions);
    }
}
