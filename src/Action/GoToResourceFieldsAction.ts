import Action from './Action';

export default class GoToResourceFieldsAction extends Action {
    static NAME = 'go_to_resource_fields';
    async run(): Promise<any> {
        window.location.assign('/dorf1.php');
    }
}
