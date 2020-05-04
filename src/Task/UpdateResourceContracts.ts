import { TaskController, registerTask, ActionDefinition } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { UpgradeBuildingTask } from './UpgradeBuildingTask';
import { ImmutableTaskList, Task } from '../Queue/TaskProvider';
import { ForgeImprovementTask } from './ForgeImprovementTask';
import { path, PathList, uniqPaths } from '../Helpers/Path';

@registerTask
export class UpdateResourceContracts extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        const tasks = this.scheduler.getTaskItems();

        const paths = [...this.walkUpgradeTasks(tasks), ...this.walkImprovementTask(tasks)];
        const uniq = uniqPaths(paths);

        return uniq.map(p => [GoToPageAction.name, { path: path(p.name, p.query) }]);
    }

    private walkUpgradeTasks(tasks: ImmutableTaskList): PathList {
        return tasks
            .filter(t => t.name === UpgradeBuildingTask.name && t.args.villageId && t.args.buildId)
            .map(t => ({
                name: '/build.php',
                query: { newdid: t.args.villageId, id: t.args.buildId },
            }));
    }

    private walkImprovementTask(tasks: ImmutableTaskList): PathList {
        return tasks
            .filter(t => t.name === ForgeImprovementTask.name && t.args.villageId && t.args.buildId)
            .map(t => ({
                name: '/build.php',
                query: { newdid: t.args.villageId, id: t.args.buildId },
            }));
    }
}
