import { elClassId, split, uniqId } from '../utils';
import { UpgradeBuildingTask } from '../Task/UpgradeBuildingTask';
import { Scheduler } from '../Scheduler';
import { TrainTroopTask } from '../Task/TrainTroopTask';
import { grabActiveVillageId } from './EveryPage';

const QUARTERS_ID = 19;

export class BuildPage {
    private scheduler: Scheduler;
    private readonly buildId: number;
    constructor(scheduler: Scheduler, buildId: number) {
        this.scheduler = scheduler;
        this.buildId = buildId;
    }

    run() {
        const buildTypeId = elClassId(jQuery('#build').attr('class') || '', 'gid');
        this.log('BUILD PAGE DETECTED', 'ID', this.buildId, 'TYPE', buildTypeId);
        this.createUpgradeButton();
        if (buildTypeId === QUARTERS_ID) {
            this.createTrainTroopButton();
        }
    }

    private createUpgradeButton() {
        const id = uniqId();
        jQuery('.upgradeButtonsContainer .section1').append(
            `<div style="padding: 8px"><a id="${id}" href="#">В очередь</a></div>`
        );
        jQuery(`#${id}`).on('click', evt => {
            evt.preventDefault();
            this.onScheduleBuilding(this.buildId);
        });
    }

    private onScheduleBuilding(buildId: number) {
        const villageId = grabActiveVillageId();
        this.scheduler.scheduleTask(UpgradeBuildingTask.name, { villageId, buildId });
        const n = new Notification(`Building ${buildId} scheduled`);
        setTimeout(() => n && n.close(), 4000);
    }

    private createTrainTroopButton() {
        const troopBlocks = jQuery('#nonFavouriteTroops .action.troop:not(.empty) .innerTroopWrapper');
        troopBlocks.each((idx, el) => {
            const troopId = elClassId(jQuery(el).attr('class') || '', 'troop');
            console.log('TROOP', troopId);
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

    private onTrainTroopClick(buildId: Number, troopId: Number, el: HTMLElement) {
        console.log('TRAIN TROOPERS', 'TROOP ID', troopId, 'BUILDING ID', buildId);
        const villageId = grabActiveVillageId();
        const input = jQuery(el).find(`input[name="t${troopId}"]`);
        const count = Number(input.val());
        if (!isNaN(count) && count > 0) {
            console.log('PREPARE TO TRAIN', count, 'TROOPERS');
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

    private log(...args) {
        console.log('BUILD PAGE:', ...args);
    }

    private logError(...args) {
        console.error(...args);
    }
}
