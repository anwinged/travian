import { TaskController, registerTask, ActionDefinition } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { path } from '../utils';
import { UpgradeBuildingTask } from './UpgradeBuildingTask';
import { ImmutableTaskList, Task } from '../Queue/TaskProvider';
import { ForgeImprovementTask } from './ForgeImprovementTask';

@registerTask
export class UpdateResourceContracts extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        const tasks = this.scheduler.getTaskItems();

        return [...this.walkUpgradeTasks(tasks), ...this.walkImprovementTask(tasks)];
    }

    private walkUpgradeTasks(tasks: ImmutableTaskList): Array<ActionDefinition> {
        return tasks
            .filter(t => t.name === UpgradeBuildingTask.name && t.args.villageId && t.args.buildId)
            .map(t => [
                GoToPageAction.name,
                { path: path('/build.php', { newdid: t.args.villageId, id: t.args.buildId }) },
            ]);
    }

    private walkImprovementTask(tasks: ImmutableTaskList): Array<ActionDefinition> {
        return tasks
            .filter(t => t.name === ForgeImprovementTask.name && t.args.villageId && t.args.buildId)
            .map(t => [
                GoToPageAction.name,
                { path: path('/build.php', { newdid: t.args.villageId, id: t.args.buildId }) },
            ]);
    }
}
