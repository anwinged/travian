import { TaskController, ActionDefinition } from './TaskController';
import { scanAllVillagesBundle } from './ActionBundles';
import { Task } from '../Queue/TaskProvider';
import { registerTask } from './TaskMap';

@registerTask()
export class GrabVillageState extends TaskController {
    defineActions(task: Task): Array<ActionDefinition> {
        const villages = this.factory.getAllVillages();
        return scanAllVillagesBundle(villages);
    }
}
