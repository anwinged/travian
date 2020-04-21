import { ActionController, registerAction } from './ActionController';
import { Args } from '../Command';
import { Task } from '../Queue/TaskQueue';
import { grabResources, grabResourceStorage } from '../Page/ResourcesBlock';
import { changeHeroResource, grabCurrentHeroResource } from '../Page/HeroPage';
import { HeroAllResources, Resources } from '../Game';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { HeroState } from '../State/HeroState';

@registerAction
export class BalanceHeroResourcesAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const activeVillageId = grabActiveVillageId();
        const heroVillageId = new HeroState().getVillageId();

        if (heroVillageId === undefined || activeVillageId !== heroVillageId) {
            changeHeroResource(HeroAllResources);
            return;
        }

        const resources = this.getRequirements(heroVillageId);

        const resourcesAsList = resources.asList();
        const currentType = grabCurrentHeroResource();

        const sorted = resourcesAsList.sort((x, y) => y.value - x.value);
        const maxRequirement = sorted[0];
        const minRequirement = sorted[sorted.length - 1];
        const delta = Math.abs(maxRequirement.value - minRequirement.value);
        const eps = Math.abs(maxRequirement.value / 10);

        console.log('REQUIREMENTS', sorted);
        console.log('REQUIREMENTS', maxRequirement, minRequirement, delta, eps);

        const resType = delta > eps ? maxRequirement.type : HeroAllResources;
        if (resType !== currentType) {
            changeHeroResource(resType);
        }
    }

    private getRequirements(heroVillageId): Resources {
        const resources = grabResources();
        const requiredResources = this.scheduler.getVillageRequiredResources(heroVillageId);
        const totalRequiredResources = this.scheduler.getTotalVillageRequiredResources(heroVillageId);

        if (requiredResources.gt(resources)) {
            return requiredResources.sub(resources);
        }

        if (totalRequiredResources.gt(resources)) {
            return totalRequiredResources.sub(resources);
        }

        const storage = grabResourceStorage();
        return Resources.fromStorage(storage).sub(resources);
    }
}
