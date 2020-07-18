import { BaseAction } from './BaseAction';
import { changeHeroResource, grabCurrentHeroResource } from '../../Page/HeroPage';
import { grabActiveVillageId } from '../../Page/VillageBlock';
import { HeroStorage } from '../../Storage/HeroStorage';
import { calcHeroResource } from '../../Core/HeroBalance';
import { HeroAllResources } from '../../Core/Hero';
import { Args } from '../../Queue/Args';
import { registerAction } from '../ActionMap';
import { Task } from '../../Queue/Task';

@registerAction
export class BalanceHeroResourcesAction extends BaseAction {
    async run(args: Args, task: Task): Promise<any> {
        const thisVillageId = grabActiveVillageId();
        const heroVillageId = new HeroStorage().getVillageId();

        if (heroVillageId === undefined || heroVillageId !== thisVillageId) {
            changeHeroResource(HeroAllResources);
            return;
        }

        const thisVillageState = this.villageFactory.createState(thisVillageId);

        const requirements = [
            thisVillageState.required.balance,
            thisVillageState.commitments,
            thisVillageState.resources.sub(thisVillageState.storage.capacity),
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
