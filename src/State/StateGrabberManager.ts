import { StateGrabber } from './StateGrabber';
import { ResourceGrabber } from './ResourceGrabber';
import { ResourcePerformanceGrabber } from './ResourcePerformanceGrabber';

export class StateGrabberManager {
    private readonly grabbers: Array<StateGrabber> = [];

    constructor() {
        this.grabbers = [];
        this.grabbers.push(new ResourceGrabber());
        this.grabbers.push(new ResourcePerformanceGrabber());
    }

    grab() {
        for (let grabber of this.grabbers) {
            grabber.grab();
        }
    }
}
