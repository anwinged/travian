import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { grabResources, grabResourceStorage } from '../Page/ResourcesBlock';
import { changeHeroResource, grabCurrentHeroResource } from '../Page/HeroPage';
import { HeroAllResources, Resources } from '../Game';
import { grabActiveVillageId } from '../Page/VillageBlock';

@registerAction
export class BalanceHeroResourcesAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const resources = this.getRequirements();

        const resourcesAsList = resources.asList();
        const currentType = grabCurrentHeroResource();

        const sorted = resourcesAsList.sort((x, y) => y.value - x.value);
        const maxRequirement = sorted[0];
        const minRequirement = sorted[sorted.length - 1];
        const delta = maxRequirement.value - minRequirement.value;
        const eps = maxRequirement.value / 10;

        const resType = delta > eps ? maxRequirement.type : HeroAllResources;
        if (resType !== currentType) {
            changeHeroResource(resType);
        }
    }

    private getRequirements() {
        const resources = grabResources();

        const villageId = grabActiveVillageId();
        const requiredResources = this.scheduler.getVillageRequiredResources(villageId);

        if (requiredResources) {
            return new Resources(
                requiredResources.lumber - resources.lumber,
                requiredResources.clay - resources.clay,
                requiredResources.iron - resources.iron,
                requiredResources.crop - resources.crop
            );
        }

        const storage = grabResourceStorage();

        return new Resources(
            storage.warehouse - resources.lumber,
            storage.warehouse - resources.clay,
            storage.warehouse - resources.iron,
            storage.granary - resources.crop
        );
    }
}
