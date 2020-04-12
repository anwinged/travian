import * as URLParse from 'url-parse';
import { uniqId, waitForLoad } from '../utils';
import { Scheduler } from '../Scheduler';
import { BuildPage } from '../Page/BuildPage';
import { UpgradeBuildingTask } from '../Task/UpgradeBuildingTask';
import { grabActiveVillage, grabActiveVillageId } from '../Page/VillageBlock';
import {
    grabResourceDeposits,
    onResourceSlotCtrlClick,
    showBuildingSlotIds,
    showResourceSlotIds,
} from '../Page/SlotBlock';
import Vue from 'vue';
import DashboardApp from './Components/DashboardApp.vue';
import { ResourcesToLevel } from '../Task/ResourcesToLevel';

export class Dashboard {
    private readonly version: string;
    private scheduler: Scheduler;

    constructor(version: string, scheduler: Scheduler) {
        this.version = version;
        this.scheduler = scheduler;
    }

    async run() {
        await waitForLoad();

        const p = new URLParse(window.location.href, true);
        this.log('PARSED LOCATION', p);

        const villageId = grabActiveVillageId();

        const scheduler = this.scheduler;
        const quickActions: any[] = [];

        const state = {
            name: 'Dashboard',
            village: grabActiveVillage(),
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
        };

        setInterval(() => state.refreshTasks(), 1000);

        const deposits = grabResourceDeposits();
        if (deposits.length) {
            const sorted = deposits.sort((x, y) => x.level - y.level);
            const minLevel = sorted[0].level;
            for (let i = minLevel + 1; i < minLevel + 4; ++i) {
                quickActions.push({
                    label: `Ресурсы до уровня ${i}`,
                    cb: () => {
                        scheduler.scheduleTask(ResourcesToLevel.name, { villageId, level: i });
                        state.refreshTasks();
                    },
                });
            }
        }

        const tasks = this.scheduler.getTaskItems();
        const buildingsInQueue = tasks
            .filter(t => t.name === UpgradeBuildingTask.name && t.args.villageId === villageId)
            .map(t => t.args.buildId || 0);

        if (p.pathname === '/dorf1.php') {
            showResourceSlotIds(buildingsInQueue);
            onResourceSlotCtrlClick(buildId => this.onResourceSlotCtrlClick(villageId, buildId, state));
            console.log(grabResourceDeposits());
        }

        if (p.pathname === '/dorf2.php') {
            showBuildingSlotIds(buildingsInQueue);
        }

        if (p.pathname === '/build.php') {
            new BuildPage(this.scheduler, Number(p.query.id)).run();
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

    private onResourceSlotCtrlClick(villageId: number, buildId: number, state) {
        this.scheduler.scheduleTask(UpgradeBuildingTask.name, { villageId, buildId });
        state.refreshTasks();
        const n = new Notification(`Building ${buildId} scheduled`);
        setTimeout(() => n && n.close(), 4000);
    }

    private log(...args) {
        console.log('SCHEDULER:', ...args);
    }

    private logError(...args) {
        console.error(...args);
    }
}
