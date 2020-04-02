import ActionController from './ActionController';
import { Args } from '../Common';
import { Task } from '../Storage/TaskQueue';
import { ActionError } from '../Errors';
import { GameState } from '../Storage/GameState';

export default class GrabHeroAttributesAction extends ActionController {
    static NAME = 'grab_hero_attributes';
    private state: GameState;

    constructor(state: GameState) {
        super();
        this.state = state;
    }

    async run(args: Args, task: Task): Promise<any> {
        const healthElement = jQuery(
            '#attributes .attribute.health .powervalue .value'
        );
        if (healthElement.length !== 1) {
            throw new ActionError(task.id, 'Health dom element not found');
        }
        const text = healthElement.text();
        let normalized = text.replace(/[^0-9]/g, '');
        const value = Number(normalized);
        if (isNaN(value)) {
            throw new ActionError(
                task.id,
                `Health value "${text}" (${normalized}) couldn't be converted to number`
            );
        }

        this.state.set('hero', { health: value });
    }
}
