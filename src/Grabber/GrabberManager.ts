import { Grabber } from './Grabber';
import { VillageResourceGrabber } from './VillageResourceGrabber';
import { VillageOverviewPageGrabber } from './VillageOverviewPageGrabber';
import { HeroPageGrabber } from './HeroPageGrabber';
import { MarketPageGrabber } from './MarketPageGrabber';

export class GrabberManager {
    private readonly grabbers: Array<Grabber> = [];

    constructor() {
        this.grabbers = [];
        this.grabbers.push(new VillageResourceGrabber());
        this.grabbers.push(new VillageOverviewPageGrabber());
        this.grabbers.push(new HeroPageGrabber());
        this.grabbers.push(new MarketPageGrabber());
    }

    grab() {
        for (let grabber of this.grabbers) {
            grabber.grab();
        }
    }
}
