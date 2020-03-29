import Action from './Action';

export default class GoToBuildingAction extends Action {
    static NAME = 'go_to_building';

    async run(args): Promise<any> {
        window.location.assign('/build.php?id=' + args.id);
        return null;
    }
}
