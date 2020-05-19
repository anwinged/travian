import { Grabber } from './Grabber';
import { VillageResourceGrabber } from './VillageResourceGrabber';
import { VillageOverviewPageGrabber } from './VillageOverviewPageGrabber';
import { HeroPageGrabber } from './HeroPageGrabber';
import { MarketPageGrabber } from './MarketPageGrabber';
import { Scheduler } from '../Scheduler';
import { BuildingContractGrabber } from './BuildingContractGrabber';
import { ForgePageGrabber } from './ForgePageGrabber';
import { GuildHallPageGrabber } from './GuildHallPageGrabber';

export class GrabberManager {
    private readonly grabbers: Array<Grabber> = [];

    constructor(scheduler: Scheduler) {
        this.grabbers = [];
        this.grabbers.push(new VillageResourceGrabber(scheduler));
        this.grabbers.push(new VillageOverviewPageGrabber(scheduler));
        this.grabbers.push(new HeroPageGrabber(scheduler));
        this.grabbers.push(new MarketPageGrabber(scheduler));
        this.grabbers.push(new BuildingContractGrabber(scheduler));
        this.grabbers.push(new ForgePageGrabber(scheduler));
        this.grabbers.push(new GuildHallPageGrabber(scheduler));
    }

    grab() {
        for (let grabber of this.grabbers) {
            grabber.grab();
        }
    }
}
