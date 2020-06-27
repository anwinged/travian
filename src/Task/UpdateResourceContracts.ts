import { ActionDefinition, TaskController } from './TaskController';
import { GoToPageAction } from '../Action/GoToPageAction';
import { UpgradeBuildingTask } from './UpgradeBuildingTask';
import { ImmutableTaskList, Task } from '../Queue/TaskProvider';
import { ForgeImprovementTask } from './ForgeImprovementTask';
import { path, PathList, uniqPaths } from '../Helpers/Path';
import { registerTask } from './TaskMap';

@registerTask()
export class UpdateResourceContracts extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        const villages = this.factory.getAllVillages();

        const tasks = villages
            .map(v => this.factory.createTaskCollection(v.id).getTasks())
            .reduce((acc, tasks) => acc.concat(tasks), []);

        const paths = uniqPaths([
            ...this.walkUpgradeTasks(tasks),
            ...this.walkImprovementTask(tasks),
        ]);

        return paths.map(p => ({
            name: GoToPageAction.name,
            args: { path: path(p.name, p.query) },
        }));
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
