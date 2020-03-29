import Action from './Action';

export default class GoToMainAction extends Action {
    async run(): Promise<any> {
        return Promise.resolve(null);
    }
}
