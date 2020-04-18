import { getNumber, parseLocation, uniqId, waitForLoad } from './utils';
import { Scheduler } from './Scheduler';
import { BuildPage } from './Page/BuildPage';
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
import { StateGrabberManager } from './State/StateGrabberManager';

interface QuickAction {
    label: string;
    cb: () => void;
}

export class ControlPanel {
    private readonly version: string;
    private readonly scheduler: Scheduler;
    private grabbers: StateGrabberManager;
    private readonly logger: Logger;

    constructor(version: string, scheduler: Scheduler) {
        this.version = version;
        this.scheduler = scheduler;
        this.grabbers = new StateGrabberManager();
        this.logger = new ConsoleLogger(this.constructor.name);
    }

    async run() {
        await waitForLoad();

        const p = parseLocation();
        this.logger.log('PARSED LOCATION', p);

        const villageId = grabActiveVillageId();

        this.grabbers.grab();
        setInterval(() => this.grabbers.grab(), 2000);

        const scheduler = this.scheduler;
        const quickActions: QuickAction[] = [];

        const state = {
            name: 'Dashboard',
            version: this.version,
            activeVillage: {},
            villages: [],
            taskList: [],
            quickActions: quickActions,

            refreshTasks() {
                this.taskList = scheduler.getTaskItems();
            },

            removeTask(taskId: string) {
                scheduler.removeTask(taskId);
                this.taskList = scheduler.getTaskItems();
            },

            refreshVillages() {
                this.villages = grabVillageList().map(village => {
                    const state = new VillageState(village.id);
                    const resources = state.getResources();
                    const storage = state.getResourceStorage();
                    const performance = state.getResourcesPerformance();
                    const buildQueueInfo = state.getBuildingQueueInfo();
                    return {
                        id: village.id,
                        name: village.name,
                        crd: village.crd,
                        active: village.active,
                        lumber: resources.lumber,
                        clay: resources.clay,
                        iron: resources.iron,
                        crop: resources.crop,
                        lumber_hour: performance.lumber,
                        clay_hour: performance.clay,
                        iron_hour: performance.iron,
                        crop_hour: performance.crop,
                        warehouse: storage.warehouse,
                        granary: storage.granary,
                        buildRemainingSeconds: buildQueueInfo.seconds,
                    };
                });
                for (let village of this.villages) {
                    if (village.active) {
                        this.activeVillage = village;
                    }
                }
            },
        };

        state.refreshTasks();
        setInterval(() => state.refreshTasks(), 2000);

        state.refreshVillages();
        setInterval(() => state.refreshVillages(), 5000);

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

        if (p.pathname === '/build.php') {
            new BuildPage(this.scheduler, getNumber(p.query.id), getNumber(p.query.category, 1)).run();
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
