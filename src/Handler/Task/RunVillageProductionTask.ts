import { BaseTask, ActionDefinition } from './BaseTask';
import { Task } from '../../Queue/TaskProvider';
import { registerTask } from '../TaskMap';

@registerTask()
export class RunVillageProductionTask extends BaseTask {
    defineActions(task: Task): Array<ActionDefinition> {
        return [];
    }
}
