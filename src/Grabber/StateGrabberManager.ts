import { StateGrabber } from './StateGrabber';
import { ResourceGrabber } from './ResourceGrabber';
import { VillageOverviewPageGrabber } from './VillageOverviewPageGrabber';
import { HeroPageGrabber } from './HeroPageGrabber';

export class StateGrabberManager {
    private readonly grabbers: Array<StateGrabber> = [];

    constructor() {
        this.grabbers = [];
        this.grabbers.push(new ResourceGrabber());
        this.grabbers.push(new VillageOverviewPageGrabber());
        this.grabbers.push(new HeroPageGrabber());
    }

    grab() {
        for (let grabber of this.grabbers) {
            grabber.grab();
        }
    }
}
