import { ActionController, registerAction } from './ActionController';
import { Task } from '../Queue/TaskQueue';
import { grabContractResources } from '../Page/BuildingPage';
import { Args } from '../Queue/Args';

@registerAction
export class UpdateBuildingTaskResourcesAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const buildingTaskId = args.targetTaskId;
        if (buildingTaskId === undefined) {
            return;
        }

        try {
            const resources = grabContractResources();
            this.scheduler.updateResources(buildingTaskId, resources);
        } catch (e) {
            return;
        }
    }
}
