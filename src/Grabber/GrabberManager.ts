import { Grabber } from './Grabber';
import { VillageResourceGrabber } from './VillageResourceGrabber';
import { VillageOverviewPageGrabber } from './VillageOverviewPageGrabber';
import { HeroPageGrabber } from './HeroPageGrabber';

export class GrabberManager {
    private readonly grabbers: Array<Grabber> = [];

    constructor() {
        this.grabbers = [];
        this.grabbers.push(new VillageResourceGrabber());
        this.grabbers.push(new VillageOverviewPageGrabber());
        this.grabbers.push(new HeroPageGrabber());
    }

    grab() {
        for (let grabber of this.grabbers) {
            grabber.grab();
        }
    }
}
