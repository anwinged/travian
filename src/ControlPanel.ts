import { parseLocation, timestamp, uniqId, waitForLoad } from './utils';
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
import { Coordinates, Village } from './Core/Village';
import { calcGatheringTimings } from './Core/GatheringTimings';
import { DataStorage } from './DataStorage';
import { getBuildingPageAttributes, isBuildingPage } from './Page/PageDetectors';
import { debounce } from 'debounce';
import { ExecutionState } from './State/ExecutionState';
import { ResourceStorage } from './Core/ResourceStorage';

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
        this.logger.info('PARSED LOCATION', p);

        const villageId = grabActiveVillageId();

        const scheduler = this.scheduler;
        const quickActions: QuickAction[] = [];

        const executionState = new ExecutionState();

        const state: any = {
            name: 'Dashboard',
            version: this.version,
            activeVillage: {},
            villages: [],
            taskList: [],
            actionList: [],
            quickActions: quickActions,
            pauseSeconds: 0,

            refresh() {
                this.taskList = scheduler.getTaskItems();
                this.actionList = scheduler.getActionItems();
                const { pauseTs } = executionState.getExecutionSettings();
                this.pauseSeconds = pauseTs - timestamp();
                this.refreshVillages();
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

            pause() {
                executionState.setExecutionSettings({ pauseTs: timestamp() + 120 });
            },
        };

        state.refresh();

        setInterval(() => {
            state.refresh();
        }, 3000);

        DataStorage.onChange(
            debounce(() => {
                state.refresh();
            }, 500)
        );

        const tasks = this.scheduler.getTaskItems();
        const buildingsInQueue = tasks
            .filter(t => t.name === UpgradeBuildingTask.name && t.args.villageId === villageId)
            .map(t => t.args.buildId || 0);

        if (p.pathname === '/dorf1.php') {
            showResourceSlotIds(buildingsInQueue);
            onResourceSlotCtrlClick(buildId => this.onResourceSlotCtrlClick(villageId, buildId));
            quickActions.push(...this.createDepositsQuickActions(villageId));
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

    private createControlPanel(state: any) {
        const appId = `app-${uniqId()}`;
        jQuery('body').prepend(`<div id="${appId}"></div>`);
        new Vue({
            el: `#${appId}`,
            data: state,
            render: h => h(DashboardApp),
        });
    }

    private createDepositsQuickActions(villageId: number) {
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
                },
            });
        }
        return quickActions;
    }

    private onResourceSlotCtrlClick(villageId: number, buildId: number) {
        this.scheduler.scheduleTask(UpgradeBuildingTask.name, { villageId, buildId });
        const n = new Notification(`Building ${buildId} scheduled`);
        setTimeout(() => n && n.close(), 4000);
    }
}

class VillageController {
    public readonly id: number;
    public readonly name: string;
    public readonly crd: Coordinates;
    public readonly active: boolean;
    public readonly lumber: number;
    public readonly clay: number;
    public readonly iron: number;
    public readonly crop: number;
    public readonly resources: Resources;
    public readonly performance: Resources;
    public readonly requiredResources: Resources;
    public readonly requiredBalance: Resources;
    public readonly totalRequiredResources: Resources;
    public readonly totalRequiredBalance: Resources;
    public readonly incomingResources: Resources;
    public readonly storage: ResourceStorage;
    public readonly warehouse: number;
    public readonly granary: number;
    public readonly buildRemainingSeconds: number;

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
        this.requiredBalance = resources.sub(requiredResources);
        this.totalRequiredResources = totalRequiredResources;
        this.totalRequiredBalance = resources.sub(totalRequiredResources);
        this.storage = storage;
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
