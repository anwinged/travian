import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { grabResources } from '../Page/ResourcesBlock';
import { changeHeroResource, grabCurrentHeroResource } from '../Page/HeroPage';
import { HeroAllResources } from '../Game';

@registerAction
export class BalanceHeroResourcesAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const resourcesAsList = grabResources().asList();
        const currentType = grabCurrentHeroResource();

        const sorted = resourcesAsList.sort((x, y) => x.value - y.value);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const delta = max.value - min.value;
        const eps = max.value / 10;

        const resType = delta > eps ? min.type : HeroAllResources;
        if (resType !== currentType) {
            changeHeroResource(resType);
        }
    }
}
