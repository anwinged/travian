import { BaseAction } from './BaseAction';
import { grabVillageList } from '../../Page/VillageBlock';
import { grabHeroVillage } from '../../Page/HeroPage';
import { HeroStorage } from '../../Storage/HeroStorage';
import { Args } from '../../Queue/Args';
import { path } from '../../Helpers/Path';
import { registerAction } from '../ActionMap';
import { Task } from '../../Queue/Task';

@registerAction
export class GoToHeroVillageAction extends BaseAction {
    async run(args: Args, task: Task): Promise<any> {
        const heroVillageId = this.getHeroVillageId();
        if (heroVillageId) {
            window.location.assign(path('/hero.php', { newdid: heroVillageId }));
        }
    }

    private getHeroVillageId(): number | undefined {
        const villages = grabVillageList();
        const heroVillage = grabHeroVillage();

        for (let village of villages) {
            if (village.name === heroVillage) {
                return village.id;
            }
        }

        return new HeroStorage().getVillageId();
    }
}
