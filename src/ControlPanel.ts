import { Scheduler } from './Scheduler';
import { BuildingPageController } from './Page/BuildingPageController';
import { UpgradeBuildingTask } from './Handler/Task/UpgradeBuildingTask';
import { grabActiveVillageId } from './Page/VillageBlock';
import {
    onBuildingSlotCtrlClick,
    onResourceSlotCtrlClick,
    showBuildingSlotIds,
    showResourceSlotIds,
} from './Page/SlotBlock';
import Vue from 'vue';
import Vuex from 'vuex';
import DashboardApp from './Dashboard/Dashboard.vue';
import { createStore } from './Dashboard/Store';
import { ConsoleLogger, Logger } from './Logger';
import { DataStorage } from './Storage/DataStorage';
import { getBuildingPageAttributes, isAdventurePage, isBuildingPage } from './Page/PageDetector';
import { ExecutionStorage } from './Storage/ExecutionStorage';
import { VillageState } from './Village/VillageState';
import { VillageFactory } from './Village/VillageFactory';
import { uniqId } from './Helpers/Identity';
import { timestamp } from './Helpers/Time';
import { notify, parseLocation, waitForLoad } from './Helpers/Browser';
import { Action } from './Queue/Action';
import { Task } from './Queue/Task';
import { HeroAttributes } from './Core/Hero';
import { HeroStorage } from './Storage/HeroStorage';
import { showAdventureDifficulty } from './Page/AdventurePage';

Vue.use(Vuex);

interface GameState {
    name: string;
    version: string;
    activeVillageState: VillageState | undefined;
    villageStates: ReadonlyArray<VillageState>;
    heroAttr: HeroAttributes;
    taskList: ReadonlyArray<Task>;
    actionList: ReadonlyArray<Action>;
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
    private readonly villageFactory: VillageFactory;

    constructor(version: string, scheduler: Scheduler, villageFactory: VillageFactory) {
        this.version = version;
        this.scheduler = scheduler;
        this.villageFactory = villageFactory;
        this.logger = new ConsoleLogger(this.constructor.name);
    }

    async run() {
        await waitForLoad();

        const p = parseLocation();
        const villageId = grabActiveVillageId();

        const scheduler = this.scheduler;
        const villageFactory = this.villageFactory;

        const executionState = new ExecutionStorage();
        const heroStorage = new HeroStorage();

        const state: GameState = {
            name: 'Control',
            version: this.version,
            activeVillageState: undefined,
            villageStates: [],
            heroAttr: HeroAttributes.default(),
            taskList: [],
            actionList: [],
            pauseSeconds: 0,

            refresh() {
                this.heroAttr = heroStorage.getAttributes();
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
                this.villageStates = villageFactory.getAllVillageStates();
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

        DataStorage.onChange(() => state.refresh());

        const getBuildingsInQueue = () =>
            this.villageFactory
                .getById(villageId)
                .taskCollection()
                .getTasks()
                .filter((t) => t.name === UpgradeBuildingTask.name)
                .map((t) => t.args.buildId || 0);

        if (p.pathname === '/dorf1.php') {
            showResourceSlotIds(getBuildingsInQueue());
            onResourceSlotCtrlClick((buildId) => {
                this.onSlotCtrlClick(villageId, buildId);
                showResourceSlotIds(getBuildingsInQueue());
            });
        }

        if (p.pathname === '/dorf2.php') {
            showBuildingSlotIds(getBuildingsInQueue());
            onBuildingSlotCtrlClick((buildId) => {
                this.onSlotCtrlClick(villageId, buildId);
                showBuildingSlotIds(getBuildingsInQueue());
            });
        }

        if (isBuildingPage()) {
            const buildPage = new BuildingPageController(
                this.scheduler,
                getBuildingPageAttributes(),
                this.villageFactory.getById(villageId).controller()
            );
            buildPage.run();
        }

        if (isAdventurePage()) {
            showAdventureDifficulty();
        }

        this.createControlPanel(state, villageFactory);
    }

    private createControlPanel(gameState: GameState, villageFactory: VillageFactory) {
        const appId = `app-${uniqId()}`;
        jQuery('body').prepend(`<div id="${appId}"></div>`);
        new Vue({
            el: `#${appId}`,
            data: gameState,
            store: createStore(villageFactory),
            render: (h) => h(DashboardApp),
        });
    }

    private onSlotCtrlClick(villageId: number, buildId: number) {
        this.scheduler.scheduleTask(UpgradeBuildingTask.name, { villageId, buildId });
        notify(`Building ${buildId} scheduled`);
    }
}
