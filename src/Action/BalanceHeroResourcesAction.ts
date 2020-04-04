import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { getNumber, trimPrefix } from '../utils';
import { AbortTaskError, ActionError } from '../Errors';

interface Resource {
    type: number;
    value: number;
}

const ALL = 0;

@registerAction
export class BalanceHeroResourcesAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const res = this.getResources();
        const currentType = this.getCurrentHeroResource(task);
        console.log('RESOURCES', res);
        console.log('CURRENT TYPE', currentType);
        const sorted = res.sort((x, y) => x.value - y.value);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const delta = max.value - min.value;
        const eps = max.value / 10;
        console.log('MIN', min, 'MAX', max, 'DELTA', delta, 'EPS', eps);
        const resType = delta > eps ? min.type : ALL;
        if (resType !== currentType) {
            this.changeToHeroResource(task, resType);
        }
    }

    private getResources(): Array<Resource> {
        const res = this.state.get('resources');
        const resList: Array<Resource> = [];
        for (let r in res) {
            const type = getNumber(r);
            const value = getNumber(res[r]);
            resList.push({ type, value });
        }
        return resList;
    }

    private getCurrentHeroResource(task: Task): number {
        for (let type of [0, 1, 2, 3, 4]) {
            const input = jQuery(`#resourceHero${type}`);
            if (input.length !== 1) {
                throw new ActionError(task.id, `Hero resource ${type} not found`);
            }
            if (input.prop('checked')) {
                return type;
            }
        }
        return 0;
    }

    private changeToHeroResource(task: Task, type: number) {
        const input = jQuery(`#resourceHero${type}`);
        if (input.length !== 1) {
            throw new ActionError(task.id, `Hero resource ${type} not found`);
        }

        const btn = jQuery('#saveHeroAttributes');
        if (btn.length !== 1) {
            throw new ActionError(task.id, `Hero resource button not found`);
        }

        input.trigger('click');
        btn.trigger('click');
    }
}
