import { ActionController, registerAction } from './ActionController';
import { changeHeroResource, grabCurrentHeroResource } from '../Page/HeroPage';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { HeroStorage } from '../Storage/HeroStorage';
import { calcHeroResource } from '../Core/HeroBalance';
import { HeroAllResources } from '../Core/Hero';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';

@registerAction
export class BalanceHeroResourcesAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const thisVillageId = grabActiveVillageId();
        const heroVillageId = new HeroStorage().getVillageId();

        if (heroVillageId === undefined || heroVillageId !== thisVillageId) {
            changeHeroResource(HeroAllResources);
            return;
        }

        const thisVillageState = this.villageStateRepository.getVillageState(thisVillageId);

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
