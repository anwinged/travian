import { parseLocation, uniqId, waitForLoad } from './utils';
import { Scheduler } from './Scheduler';
import { BuildingPageController } from './Page/BuildingPageController';
import { UpgradeBuildingTask } from './Task/UpgradeBuildingTask';
import { grabActiveVillageId, grabVillageList } from './Page/VillageBlock';
import {
    grabResourceDeposits,
    onResourceSlotCtrlClick,
    showBuildingSlotIds,
    showResourceSlotIds,
} from './Page/SlotBlock';
import Vue from 'vue';
import DashboardApp from './DashboardView/Dashboard.vue';
import { ResourcesToLevel } from './Task/ResourcesToLevel';
import { ConsoleLogger, Logger } from './Logger';
import { VillageState } from './State/VillageState';
import { Resources } from './Core/Resources';
import { Village } from './Core/Village';
import { calcGatheringTimings } from './Core/GatheringTimings';
import { DataStorage } from './DataStorage';
import { getBuildingPageAttributes, isBuildingPage } from './Page/PageDetectors';
import { debounce } from 'debounce';

interface QuickAction {
    label: string;
    cb: () => void;
}

export class ControlPanel {
    private readonly version: string;
    private readonly scheduler: Scheduler;
    private readonly logger: Logger;

    constructor(version: string, scheduler: Scheduler) {
        this.version = version;
        this.scheduler = scheduler;
        this.logger = new ConsoleLogger(this.constructor.name);
    }

    async run() {
        await waitForLoad();

        const p = parseLocation();
        this.logger.log('PARSED LOCATION', p);

        const villageId = grabActiveVillageId();

        const scheduler = this.scheduler;
        const quickActions: QuickAction[] = [];

        const state = {
            name: 'Dashboard',
            version: this.version,
            activeVillage: {},
            villages: [],
            taskList: [],
            actionList: [],
            quickActions: quickActions,

            refreshTasks() {
                this.taskList = scheduler.getTaskItems();
                this.actionList = scheduler.getActionItems();
            },

            removeTask(taskId: string) {
                scheduler.removeTask(taskId);
                this.taskList = scheduler.getTaskItems();
            },

            refreshVillages() {
                this.villages = grabVillageList().map(village => {
                    return new VillageController(village, new VillageState(village.id), scheduler);
                });
                for (let village of this.villages) {
                    if (village.active) {
                        this.activeVillage = village;
                    }
                }
            },
        };

        state.refreshTasks();
        state.refreshVillages();

        setInterval(() => {
            state.refreshTasks();
            state.refreshVillages();
        }, 3000);

        DataStorage.onChange(() => {
            debounce(() => {
                setInterval(() => state.refreshTasks(), 2000);
                setInterval(() => state.refreshVillages(), 5000);
            }, 500);
        });

        const tasks = this.scheduler.getTaskItems();
        const buildingsInQueue = tasks
            .filter(t => t.name === UpgradeBuildingTask.name && t.args.villageId === villageId)
            .map(t => t.args.buildId || 0);

        if (p.pathname === '/dorf1.php') {
            showResourceSlotIds(buildingsInQueue);
            onResourceSlotCtrlClick(buildId => this.onResourceSlotCtrlClick(villageId, buildId, state));
            quickActions.push(...this.createDepositsQuickActions(state, villageId));
        }

        if (p.pathname === '/dorf2.php') {
            showBuildingSlotIds(buildingsInQueue);
        }

        if (isBuildingPage()) {
            const buildPage = new BuildingPageController(this.scheduler, getBuildingPageAttributes());
            buildPage.run();
        }

        this.createControlPanel(state);
    }

    private createControlPanel(state) {
        const appId = `app-${uniqId()}`;
        jQuery('body').prepend(`<div id="${appId}"></div>`);
        new Vue({
            el: `#${appId}`,
            data: state,
            render: h => h(DashboardApp),
        });
    }

    private createDepositsQuickActions(state, villageId) {
        const deposits = grabResourceDeposits();
        if (deposits.length === 0) {
            return [];
        }
        const quickActions: QuickAction[] = [];
        const sorted = deposits.sort((x, y) => x.level - y.level);
        const minLevel = sorted[0].level;
        for (let i = minLevel + 1; i < minLevel + 4; ++i) {
            quickActions.push({
                label: `Ресурсы до уровня ${i}`,
                cb: () => {
                    this.scheduler.scheduleTask(ResourcesToLevel.name, { villageId, level: i });
                    state.refreshTasks();
                },
            });
        }
        return quickActions;
    }

    private onResourceSlotCtrlClick(villageId: number, buildId: number, state) {
        this.scheduler.scheduleTask(UpgradeBuildingTask.name, { villageId, buildId });
        state.refreshTasks();
        const n = new Notification(`Building ${buildId} scheduled`);
        setTimeout(() => n && n.close(), 4000);
    }
}

class VillageController {
    public readonly id;
    public readonly name;
    public readonly crd;
    public readonly active;
    public readonly lumber;
    public readonly clay;
    public readonly iron;
    public readonly crop;
    public readonly resources;
    public readonly performance;
    public readonly requiredResources;
    public readonly totalRequiredResources;
    public readonly storage;
    public readonly lumber_hour;
    public readonly clay_hour;
    public readonly iron_hour;
    public readonly crop_hour;
    public readonly lumber_need;
    public readonly clay_need;
    public readonly iron_need;
    public readonly crop_need;
    public readonly lumber_total_need;
    public readonly clay_total_need;
    public readonly iron_total_need;
    public readonly crop_total_need;
    public readonly warehouse;
    public readonly granary;
    public readonly buildRemainingSeconds;
    public readonly incomingResources: Resources;

    constructor(village: Village, state: VillageState, scheduler: Scheduler) {
        const resources = state.getResources();
        const storage = state.getResourceStorage();
        const performance = state.getResourcesPerformance();
        const buildQueueInfo = state.getBuildingQueueInfo();
        const requiredResources = scheduler.getVillageRequiredResources(village.id);
        const totalRequiredResources = scheduler.getTotalVillageRequiredResources(village.id);
        this.id = village.id;
        this.name = village.name;
        this.crd = village.crd;
        this.active = village.active;
        this.lumber = resources.lumber;
        this.clay = resources.clay;
        this.iron = resources.iron;
        this.crop = resources.crop;
        this.resources = resources;
        this.performance = performance;
        this.requiredResources = requiredResources;
        this.totalRequiredResources = totalRequiredResources;
        this.storage = storage;
        this.lumber_hour = performance.lumber;
        this.clay_hour = performance.clay;
        this.iron_hour = performance.iron;
        this.crop_hour = performance.crop;
        this.lumber_need = requiredResources.lumber;
        this.clay_need = requiredResources.clay;
        this.iron_need = requiredResources.iron;
        this.crop_need = requiredResources.crop;
        this.lumber_total_need = totalRequiredResources.lumber;
        this.clay_total_need = totalRequiredResources.clay;
        this.iron_total_need = totalRequiredResources.iron;
        this.crop_total_need = totalRequiredResources.crop;
        this.warehouse = storage.warehouse;
        this.granary = storage.granary;
        this.buildRemainingSeconds = buildQueueInfo.seconds;
        this.incomingResources = this.calcIncomingResources(state);
    }

    timeToRequired() {
        return this.timeToResources(this.requiredResources);
    }

    timeToTotalRequired() {
        return this.timeToResources(this.totalRequiredResources);
    }

    private timeToResources(resources: Resources): number {
        const timings = calcGatheringTimings(this.resources, resources, this.performance);
        if (timings.never) {
            return -1;
        }

        return timings.hours * 3600;
    }

    private calcIncomingResources(state: VillageState): Resources {
        return state.getIncomingMerchants().reduce((m, i) => m.add(i.resources), new Resources(0, 0, 0, 0));
    }
}
