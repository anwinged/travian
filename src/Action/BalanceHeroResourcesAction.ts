import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { grabResources } from '../Page/ResourcesBlock';
import { changeHeroResource, grabCurrentHeroResource } from '../Page/HeroPage';
import { HeroAllResources } from '../Game';

@registerAction
export class BalanceHeroResourcesAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const resources = grabResources().asList();
        const currentType = grabCurrentHeroResource();

        console.log('RESOURCES', resources);
        console.log('CURRENT TYPE', currentType);

        const sorted = resources.sort((x, y) => x.value - y.value);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const delta = max.value - min.value;
        const eps = max.value / 10;

        console.log('MIN', min, 'MAX', max, 'DELTA', delta, 'EPS', eps);

        const resType = delta > eps ? min.type : HeroAllResources;
        if (resType !== currentType) {
            changeHeroResource(resType);
        }
    }
}
