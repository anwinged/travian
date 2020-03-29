import Action from './Action';

export default class UpgradeBuildingAction extends Action {
    static NAME = 'upgrade_building';

    async run(args): Promise<any> {
        const btn = jQuery(
            '.upgradeButtonsContainer .section1 button.green.build'
        );
        if (btn.length === 1) {
            btn.trigger('click');
        } else {
            console.log('NO UPGRADE BUTTON');
        }
        return null;
    }
}
