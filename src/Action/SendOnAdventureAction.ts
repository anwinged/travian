import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { trimPrefix } from '../utils';
import { AbortTaskError } from '../Errors';

const CONFIG = [
    { level: 0, health: 60 },
    { level: 1, health: 50 },
    { level: 2, health: 40 },
    { level: 3, health: 30 },
    { level: 4, health: 30 },
    { level: 5, health: 30 },
];

interface Adventure {
    el: HTMLElement;
    level: number;
}

@registerAction
export class SendOnAdventureAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const adventures = this.findAdventures();

        console.log('ADVENTURES', adventures);

        adventures.sort((x, y) => x.level - y.level);

        const easiest = adventures.shift();
        const hero = this.state.get('hero') || {};

        console.log('EASIEST', easiest);
        console.log('HERO', hero);

        if (easiest && hero.health) {
            this.checkConfig(easiest, Number(hero.health));
        }

        throw new AbortTaskError(task.id, 'No suitable adventure');
    }

    private checkConfig(adventure: Adventure, health: number) {
        for (let conf of CONFIG) {
            if (adventure.level === conf.level && health >= conf.health) {
                return jQuery(adventure.el)
                    .find('td.goTo .gotoAdventure')
                    .trigger('click');
            }
        }
    }

    private findAdventures(): Array<Adventure> {
        const adventures: Array<Adventure> = [];

        jQuery('tr[id^=adventure]').each((index, el) => {
            const imgClass =
                jQuery(el)
                    .find('.difficulty img')
                    .attr('class')
                    ?.toString() || '';
            const level = Number(trimPrefix(imgClass, 'adventureDifficulty'));
            if (!isNaN(level)) {
                adventures.push({ el, level: level });
            }
        });

        return adventures;
    }
}
