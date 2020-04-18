import { elClassId, notify, split, uniqId } from '../utils';
import { UpgradeBuildingTask } from '../Task/UpgradeBuildingTask';
import { Scheduler } from '../Scheduler';
import { TrainTroopTask } from '../Task/TrainTroopTask';
import { grabActiveVillageId } from './VillageBlock';
import { ConsoleLogger, Logger } from '../Logger';
import { createBuildButton, createUpgradeButton, grabContractResources } from './BuildingPage';
import { BuildBuildingTask } from '../Task/BuildBuildingTask';

const QUARTERS_ID = 19;

export class BuildPage {
    private scheduler: Scheduler;
    private readonly buildId: number;
    private readonly logger;
    private readonly categoryId: number;

    constructor(scheduler: Scheduler, buildId: number, categoryId: number) {
        this.scheduler = scheduler;
        this.buildId = buildId;
        this.categoryId = categoryId;
        this.logger = new ConsoleLogger(this.constructor.name);
    }

    run() {
        const buildTypeId = elClassId(jQuery('#build').attr('class') || '', 'gid');
        this.logger.log('BUILD PAGE DETECTED', 'ID', this.buildId, 'TYPE', buildTypeId);

        createBuildButton(buildTypeId => this.onScheduleBuildBuilding(buildTypeId));
        createUpgradeButton(() => this.onScheduleUpgradeBuilding());

        if (buildTypeId === QUARTERS_ID) {
            this.createTrainTroopButton();
        }
    }

    private onScheduleBuildBuilding(buildTypeId: number) {
        const buildId = this.buildId;
        const categoryId = this.categoryId;
        const villageId = grabActiveVillageId();
        const resources = grabContractResources();
        this.scheduler.scheduleTask(BuildBuildingTask.name, { villageId, buildId, categoryId, buildTypeId, resources });
        notify(`Building ${buildId} scheduled`);
    }

    private onScheduleUpgradeBuilding() {
        const buildId = this.buildId;
        const villageId = grabActiveVillageId();
        const resources = grabContractResources();
        this.scheduler.scheduleTask(UpgradeBuildingTask.name, { villageId, buildId, resources });
        notify(`Upgrading ${buildId} scheduled`);
    }

    private createTrainTroopButton() {
        const troopBlocks = jQuery('#nonFavouriteTroops .action.troop:not(.empty) .innerTroopWrapper');
        troopBlocks.each((idx, el) => {
            const troopId = elClassId(jQuery(el).attr('class') || '', 'troop');
            this.logger.log('TROOP', troopId);
            if (troopId) {
                const id = uniqId();
                jQuery(el)
                    .find('.details')
                    .append(`<div style="padding: 8px 0"><a id="${id}" href="#">Обучить</a></div>`);
                jQuery(`#${id}`).on('click', evt => {
                    evt.preventDefault();
                    this.onTrainTroopClick(this.buildId, troopId, el);
                });
            }
        });
    }

    private onTrainTroopClick(buildId: number, troopId: number, el: HTMLElement) {
        this.logger.log('TRAIN TROOPERS', 'TROOP ID', troopId, 'BUILDING ID', buildId);
        const villageId = grabActiveVillageId();
        const input = jQuery(el).find(`input[name="t${troopId}"]`);
        const count = Number(input.val());
        if (!isNaN(count) && count > 0) {
            this.logger.log('PREPARE TO TRAIN', count, 'TROOPERS');
            for (let n of split(count)) {
                this.scheduler.scheduleTask(TrainTroopTask.name, {
                    villageId,
                    buildId,
                    troopId,
                    trainCount: n,
                });
            }
        }
    }
}
