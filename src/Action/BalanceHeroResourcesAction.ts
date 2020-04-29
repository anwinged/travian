import { ActionController, registerAction } from './ActionController';
import { grabVillageResources, grabVillageResourceStorage } from '../Page/ResourcesBlock';
import { changeHeroResource, grabCurrentHeroResource } from '../Page/HeroPage';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { HeroState } from '../State/HeroState';
import { calcHeroResource } from '../Core/HeroBalance';
import { HeroAllResources } from '../Core/Hero';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';

@registerAction
export class BalanceHeroResourcesAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const activeVillageId = grabActiveVillageId();
        const heroVillageId = new HeroState().getVillageId();

        if (heroVillageId === undefined || activeVillageId !== heroVillageId) {
            changeHeroResource(HeroAllResources);
            return;
        }

        const resources = grabVillageResources();
        const requiredResources = this.scheduler.getVillageRequiredResources(heroVillageId);
        const totalRequiredResources = this.scheduler.getTotalVillageRequiredResources(heroVillageId);
        const storage = grabVillageResourceStorage();
        const currentType = grabCurrentHeroResource();

        const heroType = calcHeroResource(resources, requiredResources, totalRequiredResources, storage);

        if (heroType !== currentType) {
            changeHeroResource(heroType);
        }
    }
}
