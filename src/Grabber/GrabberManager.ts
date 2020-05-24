import { Grabber } from './Grabber';
import { VillageResourceGrabber } from './VillageResourceGrabber';
import { VillageOverviewPageGrabber } from './VillageOverviewPageGrabber';
import { HeroPageGrabber } from './HeroPageGrabber';
import { MarketPageGrabber } from './MarketPageGrabber';
import { BuildingContractGrabber } from './BuildingContractGrabber';
import { ForgePageGrabber } from './ForgePageGrabber';
import { GuildHallPageGrabber } from './GuildHallPageGrabber';
import { VillageControllerFactory } from '../VillageControllerFactory';

export class GrabberManager {
    private factory: VillageControllerFactory;

    constructor(factory: VillageControllerFactory) {
        this.factory = factory;
    }

    grab() {
        const grabbers = this.createGrabbers();
        for (let grabber of grabbers) {
            grabber.grab();
        }
    }

    private createGrabbers(): Array<Grabber> {
        const controller = this.factory.getActive();
        const grabbers: Array<Grabber> = [];
        grabbers.push(new VillageResourceGrabber(controller));
        grabbers.push(new VillageOverviewPageGrabber(controller));
        grabbers.push(new HeroPageGrabber(controller));
        grabbers.push(new MarketPageGrabber(controller));
        grabbers.push(new BuildingContractGrabber(controller));
        grabbers.push(new ForgePageGrabber(controller));
        grabbers.push(new GuildHallPageGrabber(controller));
        return grabbers;
    }
}
