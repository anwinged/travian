import { notify, parseLocation, timestamp, uniqId, waitForLoad } from './utils';
import { Scheduler } from './Scheduler';
import { BuildingPageController } from './Page/BuildingPageController';
import { UpgradeBuildingTask } from './Task/UpgradeBuildingTask';
import { grabActiveVillageId, grabVillageList } from './Page/VillageBlock';
import {
    grabResourceDeposits,
    onBuildingSlotCtrlClick,
    onResourceSlotCtrlClick,
    showBuildingSlotIds,
    showResourceSlotIds,
} from './Page/SlotBlock';
import Vue from 'vue';
import DashboardApp from './DashboardView/Dashboard.vue';
import { ResourcesToLevel } from './Task/ResourcesToLevel';
import { ConsoleLogger, Logger } from './Logger';
import { DataStorage } from './DataStorage';
import { getBuildingPageAttributes, isBuildingPage } from './Page/PageDetectors';
import { ExecutionStorage } from './Storage/ExecutionStorage';
import { createVillageStates, VillageState } from './VillageState';
import { Task } from './Queue/TaskProvider';
import { Action } from './Queue/ActionQueue';
import * as _ from 'underscore';

interface QuickAction {
    label: string;
    cb: () => void;
}

interface GameState {
    name: string;
    version: string;
    activeVillageState: VillageState | undefined;
    villageStates: ReadonlyArray<VillageState>;
    taskList: ReadonlyArray<Task>;
    actionList: ReadonlyArray<Action>;
    quickActions: Array<QuickAction>;
    pauseSeconds: number;

    refresh(): void;
    removeTask(taskId: string): void;
    refreshVillages(): void;
    pause(): void;
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

        const executionState = new ExecutionStorage();

        const state: GameState = {
            name: 'Control',
            version: this.version,
            activeVillageState: undefined,
            villageStates: [],
            taskList: [],
            actionList: [],
            quickActions: [],
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
                this.villageStates = createVillageStates(grabVillageList(), scheduler);
                for (let state of this.villageStates) {
                    if (state.village.active) {
                        this.activeVillageState = state;
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
            _.debounce(() => {
                state.refresh();
            }, 500)
        );

        const getBuildingsInQueue = () =>
            this.scheduler
                .getTaskItems()
                .filter(t => t.name === UpgradeBuildingTask.name && t.args.villageId === villageId)
                .map(t => t.args.buildId || 0);

        if (p.pathname === '/dorf1.php') {
            showResourceSlotIds(getBuildingsInQueue());
            state.quickActions.push(...this.createDepositsQuickActions(villageId));
            onResourceSlotCtrlClick(buildId => {
                this.onSlotCtrlClick(villageId, buildId);
                showResourceSlotIds(getBuildingsInQueue());
            });
        }

        if (p.pathname === '/dorf2.php') {
            showBuildingSlotIds(getBuildingsInQueue());
            onBuildingSlotCtrlClick(buildId => {
                this.onSlotCtrlClick(villageId, buildId);
                showBuildingSlotIds(getBuildingsInQueue());
            });
        }

        if (isBuildingPage()) {
            const buildPage = new BuildingPageController(this.scheduler, getBuildingPageAttributes());
            buildPage.run();
        }

        this.createControlPanel(state);
    }

    private createControlPanel(gameState: GameState) {
        const appId = `app-${uniqId()}`;
        jQuery('body').prepend(`<div id="${appId}"></div>`);
        new Vue({
            el: `#${appId}`,
            data: gameState,
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

    private onSlotCtrlClick(villageId: number, buildId: number) {
        this.scheduler.scheduleTask(UpgradeBuildingTask.name, { villageId, buildId });
        notify(`Building ${buildId} scheduled`);
    }
}
