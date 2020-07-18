import { BaseTask, ActionDefinition } from './BaseTask';
import { scanAllVillagesBundle } from '../ActionBundles';
import { registerTask } from '../TaskMap';
import { Task } from '../../Queue/Task';

@registerTask()
export class GrabVillageStateTask extends BaseTask {
    defineActions(task: Task): Array<ActionDefinition> {
        const villages = this.factory.getAllVillages();
        return scanAllVillagesBundle(villages);
    }
}
