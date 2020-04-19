import { elClassId, notify, split, uniqId } from '../utils';
import { UpgradeBuildingTask } from '../Task/UpgradeBuildingTask';
import { Scheduler } from '../Scheduler';
import { TrainTroopTask } from '../Task/TrainTroopTask';
import { grabActiveVillageId } from './VillageBlock';
import { ConsoleLogger, Logger } from '../Logger';
import { createBuildButton, createTrainTroopButtons, createUpgradeButton, grabContractResources } from './BuildingPage';
import { BuildBuildingTask } from '../Task/BuildBuildingTask';
import { Resources } from '../Game';

const QUARTERS_ID = 19;
const HORSE_STABLE_ID = 20;
const EMBASSY_ID = 25;

export interface BuildingPageAttributes {
    buildId: number;
    buildTypeId: number;
    categoryId: number;
    tabId: number;
}

export class BuildingPageController {
    private scheduler: Scheduler;
    private readonly attributes: BuildingPageAttributes;
    private readonly logger;

    constructor(scheduler: Scheduler, attributes: BuildingPageAttributes) {
        this.scheduler = scheduler;
        this.attributes = attributes;
        this.logger = new ConsoleLogger(this.constructor.name);
    }

    run() {
        const buildTypeId = this.attributes.buildTypeId;
        this.logger.log('BUILD PAGE DETECTED', 'ID', this.attributes.buildId, 'TYPE', buildTypeId);

        createBuildButton(buildTypeId => this.onScheduleBuildBuilding(buildTypeId));
        createUpgradeButton(() => this.onScheduleUpgradeBuilding());

        if (buildTypeId === QUARTERS_ID) {
            createTrainTroopButtons((troopId, res, count) => this.onScheduleTrainTroopers(troopId, res, count));
        }

        if (buildTypeId === HORSE_STABLE_ID) {
            createTrainTroopButtons((troopId, res, count) => this.onScheduleTrainTroopers(troopId, res, count));
        }

        if (buildTypeId === EMBASSY_ID && this.attributes.tabId === 1) {
            createTrainTroopButtons((troopId, res, count) => this.onScheduleTrainTroopers(troopId, res, count));
        }
    }

    private onScheduleBuildBuilding(buildTypeId: number) {
        const buildId = this.attributes.buildId;
        const categoryId = this.attributes.categoryId;
        const villageId = grabActiveVillageId();
        const resources = grabContractResources();
        this.scheduler.scheduleTask(BuildBuildingTask.name, { villageId, buildId, categoryId, buildTypeId, resources });
        notify(`Building ${buildId} scheduled`);
    }

    private onScheduleUpgradeBuilding() {
        const buildId = this.attributes.buildId;
        const villageId = grabActiveVillageId();
        const resources = grabContractResources();
        this.scheduler.scheduleTask(UpgradeBuildingTask.name, { villageId, buildId, resources });
        notify(`Upgrading ${buildId} scheduled`);
    }

    private onScheduleTrainTroopers(troopId: number, resources: Resources, count: number) {
        const tabId = this.attributes.tabId;
        for (let chunk of split(count)) {
            const args = {
                villageId: grabActiveVillageId(),
                buildId: this.attributes.buildId,
                buildTypeId: this.attributes.buildTypeId,
                tabId,
                troopId,
                resources: resources.scale(chunk),
                trainCount: chunk,
            };
            console.log('TRAIN TROOP', args);
            this.scheduler.scheduleTask(TrainTroopTask.name, args);
        }
        notify(`Training ${count} troopers scheduled`);
    }
}