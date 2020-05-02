import { ActionController, registerAction } from './ActionController';
import { grabVillageResources, grabVillageResourceStorage } from '../Page/ResourcesBlock';
import { changeHeroResource, grabCurrentHeroResource } from '../Page/HeroPage';
import { grabActiveVillageId, grabVillageList } from '../Page/VillageBlock';
import { HeroStorage } from '../Storage/HeroStorage';
import { calcHeroResource } from '../Core/HeroBalance';
import { HeroAllResources } from '../Core/Hero';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';
import { Resources } from '../Core/Resources';
import { createVillageStates } from '../VillageState';
import { ActionError } from '../Errors';

@registerAction
export class BalanceHeroResourcesAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const thisVillageId = grabActiveVillageId();
        const heroVillageId = new HeroStorage().getVillageId();

        if (heroVillageId === undefined || heroVillageId !== thisVillageId) {
            changeHeroResource(HeroAllResources);
            return;
        }

        const villages = grabVillageList();
        const villageStates = createVillageStates(villages, this.scheduler);
        const thisVillageState = villageStates.find(s => s.id === thisVillageId);

        if (!thisVillageState) {
            throw new ActionError(`State for village ${thisVillageId} not found`);
        }

        const requirements = [
            thisVillageState.required.balance,
            thisVillageState.commitments,
            thisVillageState.totalRequired.balance,
            thisVillageState.resources.sub(thisVillageState.storage),
        ];

        console.log('Requirements');
        console.table(requirements);

        const heroType = calcHeroResource(requirements);
        const currentType = grabCurrentHeroResource();

        if (heroType !== currentType) {
            changeHeroResource(heroType);
        }
    }
}
