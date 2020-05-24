import { TaskController, ActionDefinition } from './TaskController';
import { scanAllVillagesBundle } from './ActionBundles';
import { Task } from '../Queue/TaskProvider';
import { registerTask } from './TaskMap';

@registerTask()
export class RunVillageProductionTask extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        return [];
    }
}
