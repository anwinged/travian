import { Grabber } from './Grabber';
import { VillageResourceGrabber } from './VillageResourceGrabber';
import { VillageOverviewPageGrabber } from './VillageOverviewPageGrabber';
import { HeroPageGrabber } from './HeroPageGrabber';
import { MarketPageGrabber } from './MarketPageGrabber';
import { BuildingContractGrabber } from './BuildingContractGrabber';
import { ForgePageGrabber } from './ForgePageGrabber';
import { GuildHallPageGrabber } from './GuildHallPageGrabber';
import { VillageFactory } from '../VillageFactory';

export class GrabberManager {
    private factory: VillageFactory;

    constructor(factory: VillageFactory) {
        this.factory = factory;
    }

    grab() {
        const grabbers = this.createGrabbers();
        for (let grabber of grabbers) {
            grabber.grab();
        }
    }

    private createGrabbers(): Array<Grabber> {
        const storage = this.factory.createStorageForActiveVillage();
        const taskCollection = this.factory.createTaskCollectionForActiveVillage();
        const grabbers: Array<Grabber> = [];
        grabbers.push(new VillageResourceGrabber(taskCollection, storage));
        grabbers.push(new VillageOverviewPageGrabber(taskCollection, storage));
        grabbers.push(new HeroPageGrabber(taskCollection, storage));
        grabbers.push(new MarketPageGrabber(taskCollection, storage));
        grabbers.push(new BuildingContractGrabber(taskCollection, storage));
        grabbers.push(new ForgePageGrabber(taskCollection, storage));
        grabbers.push(new GuildHallPageGrabber(taskCollection, storage));
        return grabbers;
    }
}
