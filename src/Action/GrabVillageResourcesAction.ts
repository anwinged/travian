import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { getNumber } from '../utils';
import { ActionError } from '../Errors';

const LUMBER = 1;
const CLAY = 2;
const IRON = 3;
const CROP = 4;

@registerAction
export class GrabVillageResourcesAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const lumber = this.grabResource(task, LUMBER);
        const clay = this.grabResource(task, CLAY);
        const iron = this.grabResource(task, IRON);
        const crop = this.grabResource(task, CROP);

        this.state.set('resources', { [LUMBER]: lumber, [CLAY]: clay, [IRON]: iron, [CROP]: crop });
    }

    private grabResource(task: Task, type: number): number {
        const stockBarElement = jQuery('#stockBar');
        if (stockBarElement.length !== 1) {
            throw new ActionError(task.id, 'Stock Bar not found');
        }

        const resElement = stockBarElement.find(`#l${type}`);
        if (resElement.length !== 1) {
            throw new ActionError(task.id, `Resource #${type} not found`);
        }

        return getNumber(resElement.text().replace(/[^0-9]/g, ''));
    }
}
