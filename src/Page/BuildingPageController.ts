import { UpgradeBuildingTask } from '../Handler/Task/UpgradeBuildingTask';
import { Scheduler } from '../Scheduler';
import { TrainTroopTask } from '../Handler/Task/TrainTroopTask';
import { grabActiveVillageId, grabVillageList } from './VillageBlock';
import { ConsoleLogger, Logger } from '../Logger';
import { createBuildButton, createUpgradeButton } from './BuildingPage/BuildingPage';
import { BuildBuildingTask } from '../Handler/Task/BuildBuildingTask';
import { Resources } from '../Core/Resources';
import { Coordinates } from '../Core/Village';
import { SendResourcesTask } from '../Handler/Task/SendResourcesTask';
import { EMBASSY_ID, HORSE_STABLE_ID, PALACE_ID, QUARTERS_ID } from '../Core/Buildings';
import {
    BuildingPageAttributes,
    isForgePage,
    isGuildHallPage,
    isMarketSendResourcesPage,
} from './PageDetector';
import { createTrainTroopButtons } from './BuildingPage/TrooperPage';
import { createSendResourcesButton } from './BuildingPage/MarketPage';
import { createResearchButtons } from './BuildingPage/ForgePage';
import { ForgeImprovementTask } from '../Handler/Task/ForgeImprovementTask';
import { createCelebrationButtons } from './BuildingPage/GuildHallPage';
import { CelebrationTask } from '../Handler/Task/CelebrationTask';
import { VillageController } from '../Village/VillageController';
import { notify } from '../Helpers/Browser';

export class BuildingPageController {
    private scheduler: Scheduler;
    private readonly attributes: BuildingPageAttributes;
    private villageController: VillageController;
    private readonly logger: Logger;

    constructor(
        scheduler: Scheduler,
        attributes: BuildingPageAttributes,
        villageController: VillageController
    ) {
        this.scheduler = scheduler;
        this.attributes = attributes;
        this.villageController = villageController;
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
            createTrainTroopButtons((troopId, res, count) =>
                this.onScheduleTrainTroopers(troopId, res, count)
            );
        }

        if (buildTypeId === HORSE_STABLE_ID) {
            createTrainTroopButtons((troopId, res, count) =>
                this.onScheduleTrainTroopers(troopId, res, count)
            );
        }

        if (buildTypeId === EMBASSY_ID && sheetId === 1) {
            createTrainTroopButtons((troopId, res, count) =>
                this.onScheduleTrainTroopers(troopId, res, count)
            );
        }

        if (buildTypeId === PALACE_ID && sheetId === 1) {
            createTrainTroopButtons((troopId, res, count) =>
                this.onScheduleTrainTroopers(troopId, res, count)
            );
        }

        if (isMarketSendResourcesPage()) {
            createSendResourcesButton((res, crd) => this.onSendResources(crd));
        }

        if (isForgePage()) {
            createResearchButtons((res, unitId) => this.onResearch(res, unitId));
        }

        if (isGuildHallPage()) {
            createCelebrationButtons((res, index) => this.onCelebration(res, index));
        }
    }

    private onScheduleBuildBuilding(buildTypeId: number, resources: Resources) {
        const buildId = this.attributes.buildId;
        const categoryId = this.attributes.categoryId;
        const villageId = grabActiveVillageId();
        this.villageController.addTask(BuildBuildingTask.name, {
            villageId,
            buildId,
            categoryId,
            buildTypeId,
            resources,
        });
        notify(`Building ${buildId} scheduled`);
    }

    private onScheduleUpgradeBuilding(resources: Resources) {
        const buildId = this.attributes.buildId;
        const villageId = grabActiveVillageId();
        this.villageController.addTask(UpgradeBuildingTask.name, { villageId, buildId, resources });
        notify(`Upgrading ${buildId} scheduled`);
    }

    private onScheduleTrainTroopers(troopId: number, resources: Resources, trainCount: number) {
        const args = {
            villageId: grabActiveVillageId(),
            buildId: this.attributes.buildId,
            buildTypeId: this.attributes.buildTypeId,
            sheetId: this.attributes.sheetId,
            troopId,
            trainCount,
            troopResources: resources,
            resources: resources.scale(trainCount),
        };
        this.villageController.addTask(TrainTroopTask.name, args);
        notify(`Training ${trainCount} troopers scheduled`);
    }

    private onSendResources(coordinates: Coordinates) {
        const villageId = grabActiveVillageId();
        const targetVillage = grabVillageList().find(v => v.crd.eq(coordinates));
        this.scheduler.scheduleTask(SendResourcesTask.name, {
            villageId: villageId,
            targetVillageId: targetVillage?.id,
            buildTypeId: this.attributes.buildTypeId,
            buildId: this.attributes.buildId,
            tabId: this.attributes.tabId,
            coordinates,
        });
        notify(`Send resources from ${villageId} to ${JSON.stringify(coordinates)}`);
    }

    private onResearch(resources: Resources, unitId: number) {
        const villageId = grabActiveVillageId();
        this.villageController.addTask(ForgeImprovementTask.name, {
            villageId,
            buildTypeId: this.attributes.buildTypeId,
            buildId: this.attributes.buildId,
            unitId,
            resources,
        });
        notify(`Researching ${unitId} scheduled`);
    }

    private onCelebration(resources: Resources, index: number) {
        const villageId = grabActiveVillageId();
        this.villageController.addTask(CelebrationTask.name, {
            villageId,
            buildTypeId: this.attributes.buildTypeId,
            buildId: this.attributes.buildId,
            resources,
            celebrationIndex: index,
        });
        notify(`Celebration scheduled`);
    }
}
