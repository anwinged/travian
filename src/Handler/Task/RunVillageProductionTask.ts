import { BaseTask, ActionDefinition } from './BaseTask';
import { registerTask } from '../TaskMap';
import { Task } from '../../Queue/Task';

@registerTask()
export class RunVillageProductionTask extends BaseTask {
    defineActions(task: Task): Array<ActionDefinition> {
        return [];
    }
}
