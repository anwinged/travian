import { ActionController, registerAction } from './ActionController';
import { Args } from '../Command';
import { Task } from '../Queue/TaskQueue';
import { grabResources, grabResourceStorage } from '../Page/ResourcesBlock';
import { changeHeroResource, grabCurrentHeroResource } from '../Page/HeroPage';
import { HeroAllResources } from '../Game';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { HeroState } from '../State/HeroState';
import { calcHeroResource } from '../Core/HeroBalance';

@registerAction
export class BalanceHeroResourcesAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const activeVillageId = grabActiveVillageId();
        const heroVillageId = new HeroState().getVillageId();

        if (heroVillageId === undefined || activeVillageId !== heroVillageId) {
            changeHeroResource(HeroAllResources);
            return;
        }

        const resources = grabResources();
        const requiredResources = this.scheduler.getVillageRequiredResources(heroVillageId);
        const totalRequiredResources = this.scheduler.getTotalVillageRequiredResources(heroVillageId);
        const storage = grabResourceStorage();
        const currentType = grabCurrentHeroResource();

        const heroType = calcHeroResource(resources, requiredResources, totalRequiredResources, storage);

        if (heroType !== currentType) {
            changeHeroResource(heroType);
        }
    }
}
