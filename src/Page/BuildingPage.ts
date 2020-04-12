import { GrabError } from '../Errors';

export function clickUpgradeButton() {
    const btn = jQuery('.upgradeButtonsContainer .section1 button.green.build');
    if (btn.length !== 1) {
        throw new GrabError('No upgrade button, try later');
    }
    btn.trigger('click');
}
