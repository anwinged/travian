import { BaseTask, ActionDefinition } from './BaseTask';
import { scanAllVillagesBundle } from '../ActionBundles';
import { Task } from '../../Queue/TaskProvider';
import { registerTask } from '../TaskMap';

@registerTask()
export class GrabVillageStateTask extends BaseTask {
    defineActions(task: Task): Array<ActionDefinition> {
        const villages = this.factory.getAllVillages();
        return scanAllVillagesBundle(villages);
    }
}
