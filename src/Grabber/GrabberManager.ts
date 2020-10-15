import { Grabber } from './Grabber';
import { VillageResourceGrabber } from './VillageResourceGrabber';
import { VillageOverviewPageGrabber } from './VillageOverviewPageGrabber';
import { HeroPageGrabber } from './HeroPageGrabber';
import { MarketPageGrabber } from './MarketPageGrabber';
import { BuildingContractGrabber } from './BuildingContractGrabber';
import { ForgePageGrabber } from './ForgePageGrabber';
import { GuildHallPageGrabber } from './GuildHallPageGrabber';
import { VillageFactory } from '../Village/VillageFactory';
import { VillageBuildingsPageGrabber } from './VillageBuildingsPageGrabber';
import { GrabError } from '../Errors';
import { Logger } from '../Logger';

export class GrabberManager {
    constructor(private readonly factory: VillageFactory, private readonly logger: Logger) {}

    grab() {
        const grabbers = this.createGrabbers();
        for (let grabber of grabbers) {
            try {
                grabber.grab();
            } catch (e) {
                if (e instanceof GrabError) {
                    this.logger.warn('Grabbers fails with', e.message);
                } else {
                    throw e;
                }
            }
        }
    }

    private createGrabbers(): Array<Grabber> {
        const storage = this.factory.active().storage();
        const taskCollection = this.factory.active().taskCollection();
        const grabbers: Array<Grabber> = [];
        grabbers.push(new VillageResourceGrabber(taskCollection, storage));
        grabbers.push(new VillageOverviewPageGrabber(taskCollection, storage));
        grabbers.push(new VillageBuildingsPageGrabber(taskCollection, storage));
        grabbers.push(new HeroPageGrabber(taskCollection, storage));
        grabbers.push(new MarketPageGrabber(taskCollection, storage));
        grabbers.push(new BuildingContractGrabber(taskCollection, storage));
        grabbers.push(new ForgePageGrabber(taskCollection, storage));
        grabbers.push(new GuildHallPageGrabber(taskCollection, storage));
        return grabbers;
    }
}
