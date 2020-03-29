import Action from './Action';
import { Args } from '../Common';
import { TryLaterError } from '../Errors';

export default class UpgradeBuildingAction extends Action {
    static NAME = 'upgrade_building';

    async run(args: Args): Promise<any> {
        const btn = jQuery(
            '.upgradeButtonsContainer .section1 button.green.build'
        );
        if (btn.length === 1) {
            btn.trigger('click');
        } else {
            console.log('NO UPGRADE BUTTON');
            throw new TryLaterError(60);
        }
        return null;
    }
}
