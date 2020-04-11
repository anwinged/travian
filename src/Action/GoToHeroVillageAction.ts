import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { grabVillageList } from '../Page/VillageBlock';
import { grabHeroVillage } from '../Page/HeroPage';
import { path } from '../utils';

@registerAction
export class GoToHeroVillageAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const heroVillageId = this.getHeroVillageId();
        if (heroVillageId) {
            window.location.assign(path('/hero.php', { newdid: heroVillageId }));
        }
    }

    private getHeroVillageId(): number | undefined {
        const villages = grabVillageList();
        const heroVillage = grabHeroVillage();

        console.log('VILLAGES', villages);
        console.log('HERO VILLAGE', heroVillage);

        for (let village of villages) {
            if (village.name === heroVillage) {
                return village.id;
            }
        }

        return undefined;
    }
}