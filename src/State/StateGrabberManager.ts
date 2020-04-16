import { StateGrabber } from './StateGrabber';
import { ResourceGrabber } from './ResourceGrabber';

export class StateGrabberManager {
    private grabbers: Array<StateGrabber> = [];

    constructor() {
        this.grabbers = [];
        this.grabbers.push(new ResourceGrabber());
    }

    grab() {
        for (let grabber of this.grabbers) {
            grabber.grab();
        }
    }
}
