import { TaskController, registerTask, ActionDefinition } from './TaskController';
import { scanAllVillagesBundle } from './ActionBundles';
import { Task } from '../Queue/TaskQueue';

@registerTask
export class GrabVillageState extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        return scanAllVillagesBundle();
    }
}
