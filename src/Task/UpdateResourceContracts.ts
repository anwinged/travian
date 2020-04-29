import { Task } from '../Queue/TaskQueue';
import { TaskController, registerTask } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { path } from '../utils';
import { UpgradeBuildingTask } from './UpgradeBuildingTask';
import { UpdateBuildingTaskResourcesAction } from '../Action/UpdateBuildingTaskResourcesAction';
import { CompleteTaskAction } from '../Action/CompleteTaskAction';
import { Action } from '../Queue/ActionQueue';
import { Args } from '../Queue/Args';

@registerTask
export class UpdateResourceContracts extends TaskController {
    async run(task: Task) {
        const args: Args = { ...task.args, taskId: task.id };

        const actions: Array<Action> = [];

        const tasks = this.scheduler.getTaskItems();
        for (let task of tasks) {
            const { villageId, buildId } = task.args;
            if (task.name === UpgradeBuildingTask.name && villageId && buildId) {
                actions.push(
                    new Action(GoToPageAction.name, {
                        ...args,
                        path: path('/build.php', { newdid: villageId, id: buildId }),
                    })
                );
                actions.push(new Action(UpdateBuildingTaskResourcesAction.name, { ...args, targetTaskId: task.id }));
            }
        }

        actions.push(new Action(CompleteTaskAction.name, args));

        this.scheduler.scheduleActions(actions);
    }
}
