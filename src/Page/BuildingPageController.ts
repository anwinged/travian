import { notify, split } from '../utils';
import { UpgradeBuildingTask } from '../Task/UpgradeBuildingTask';
import { Scheduler } from '../Scheduler';
import { TrainTroopTask } from '../Task/TrainTroopTask';
import { grabActiveVillageId } from './VillageBlock';
import { ConsoleLogger, Logger } from '../Logger';
import {
    createBuildButton,
    createSendResourcesButton,
    createTrainTroopButtons,
    createUpgradeButton,
    grabIncomingMerchants,
} from './BuildingPage';
import { BuildBuildingTask } from '../Task/BuildBuildingTask';
import { Resources } from '../Core/Resources';
import { Coordinates } from '../Core/Village';
import { SendResourcesTask } from '../Task/SendResourcesTask';
import { EMBASSY_ID, HORSE_STABLE_ID, QUARTERS_ID } from '../Core/Buildings';
import { BuildingPageAttributes, isMarketSendResourcesPage } from './PageDetectors';

export class BuildingPageController {
    private scheduler: Scheduler;
    private readonly attributes: BuildingPageAttributes;
    private readonly logger: Logger;

    constructor(scheduler: Scheduler, attributes: BuildingPageAttributes) {
        this.scheduler = scheduler;
        this.attributes = attributes;
        this.logger = new ConsoleLogger(this.constructor.name);
    }

    run() {
        const { buildTypeId, sheetId } = this.attributes;
        this.logger.info('BUILD PAGE DETECTED', 'ID', this.attributes.buildId, this.attributes);

        if (buildTypeId) {
            createUpgradeButton(res => this.onScheduleUpgradeBuilding(res));
        } else {
            createBuildButton((buildTypeId, res) => this.onScheduleBuildBuilding(buildTypeId, res));
        }

        if (buildTypeId === QUARTERS_ID) {
            createTrainTroopButtons((troopId, res, count) => this.onScheduleTrainTroopers(troopId, res, count));
        }

        if (buildTypeId === HORSE_STABLE_ID) {
            createTrainTroopButtons((troopId, res, count) => this.onScheduleTrainTroopers(troopId, res, count));
        }

        if (buildTypeId === EMBASSY_ID && sheetId === 1) {
            createTrainTroopButtons((troopId, res, count) => this.onScheduleTrainTroopers(troopId, res, count));
        }

        if (isMarketSendResourcesPage()) {
            createSendResourcesButton((res, crd, scale) => this.onSendResources(res, crd, scale));
        }
    }

    private onScheduleBuildBuilding(buildTypeId: number, resources: Resources) {
        const buildId = this.attributes.buildId;
        const categoryId = this.attributes.categoryId;
        const villageId = grabActiveVillageId();
        this.scheduler.scheduleTask(BuildBuildingTask.name, { villageId, buildId, categoryId, buildTypeId, resources });
        notify(`Building ${buildId} scheduled`);
    }

    private onScheduleUpgradeBuilding(resources: Resources) {
        const buildId = this.attributes.buildId;
        const villageId = grabActiveVillageId();
        this.scheduler.scheduleTask(UpgradeBuildingTask.name, { villageId, buildId, resources });
        notify(`Upgrading ${buildId} scheduled`);
    }

    private onScheduleTrainTroopers(troopId: number, resources: Resources, count: number) {
        for (let chunk of split(count)) {
            const args = {
                villageId: grabActiveVillageId(),
                buildId: this.attributes.buildId,
                buildTypeId: this.attributes.buildTypeId,
                sheetId: this.attributes.sheetId,
                troopId,
                resources: resources.scale(chunk),
                trainCount: chunk,
            };
            console.log('TRAIN TROOP', args);
            this.scheduler.scheduleTask(TrainTroopTask.name, args);
        }
        notify(`Training ${count} troopers scheduled`);
    }

    private onSendResources(resources: Resources, coordinates: Coordinates, scale: number) {
        const villageId = grabActiveVillageId();
        this.scheduler.scheduleTask(SendResourcesTask.name, {
            villageId: villageId,
            buildTypeId: this.attributes.buildTypeId,
            buildId: this.attributes.buildId,
            tabId: this.attributes.tabId,
            resources: resources.scale(scale),
            coordinates,
        });
        notify(`Send resources ${JSON.stringify(resources)} from ${villageId} to ${JSON.stringify(coordinates)}`);
    }
}
