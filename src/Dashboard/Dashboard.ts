import * as URLParse from 'url-parse';
import { getNumber, uniqId, waitForLoad } from '../utils';
import { Scheduler } from '../Scheduler';
import { BuildPage } from '../Page/BuildPage';
import { UpgradeBuildingTask } from '../Task/UpgradeBuildingTask';
import { grabActiveVillage, grabActiveVillageId, grabVillageList } from '../Page/VillageBlock';
import {
    grabResourceDeposits,
    onResourceSlotCtrlClick,
    showBuildingSlotIds,
    showResourceSlotIds,
} from '../Page/SlotBlock';
import Vue from 'vue';
import DashboardApp from './Components/DashboardApp.vue';
import { ResourcesToLevel } from '../Task/ResourcesToLevel';
import { Logger } from '../Logger';
import { Resources } from '../Game';
import { VillageState } from '../State/VillageState';
import { StateGrabberManager } from '../State/StateGrabberManager';

interface QuickAction {
    label: string;
    cb: () => void;
}

export class Dashboard {
    private readonly version: string;
    private scheduler: Scheduler;
    private readonly logger;
    private grabbers: StateGrabberManager;

    constructor(version: string, scheduler: Scheduler) {
        this.version = version;
        this.scheduler = scheduler;
        this.grabbers = new StateGrabberManager();
        this.logger = new Logger(this.constructor.name);
    }

    async run() {
        await waitForLoad();

        const p = new URLParse(window.location.href, true);
        this.logger.log('PARSED LOCATION', p);

        const villageId = grabActiveVillageId();

        this.grabbers.grab();

        const scheduler = this.scheduler;
        const quickActions: QuickAction[] = [];

        const state = {
            name: 'Dashboard',
            village: grabActiveVillage(),
            villages: grabVillageList(),
            version: this.version,
            taskList: this.scheduler.getTaskItems(),
            quickActions: quickActions,

            refreshTasks() {
                this.taskList = scheduler.getTaskItems();
            },

            removeTask(taskId: string) {
                scheduler.removeTask(taskId);
                this.taskList = scheduler.getTaskItems();
            },

            getVillageResources(villageId): Resources {
                const state = new VillageState(villageId);
                return state.getResources();
            },
        };

        setInterval(() => state.refreshTasks(), 1000);

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
