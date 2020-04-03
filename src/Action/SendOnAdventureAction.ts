import { ActionController, registerAction } from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { trimPrefix } from '../utils';
import { AbortTaskError } from '../Errors';

const HARD = 0;
const NORMAL = 3;

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
            if (easiest.level === NORMAL && hero.health >= 30) {
                return jQuery(easiest.el)
                    .find('td.goTo .gotoAdventure')
                    .trigger('click');
            }
            if (easiest.level === HARD && hero.health >= 50) {
                return jQuery(easiest.el)
                    .find('td.goTo .gotoAdventure')
                    .trigger('click');
            }
        }

        throw new AbortTaskError(task.id, 'No suitable adventure');
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
