import Vuex from 'vuex';
import { VillageSettings, VillageSettingsDefaults } from '../Core/Village';
import { VillageStorage } from '../Storage/VillageStorage';
import { VillageFactory } from '../Village/VillageFactory';
import { StorageContainer } from '../Storage/StorageContainer';
import { getNumber } from '../Helpers/Convert';
import { notify } from '../Helpers/Browser';

export enum Mutations {
    showLogs = 'showLogs',
    hideLogs = 'hideLogs',
    toggleLogs = 'toggleLogs',
    updateLogs = 'updateLogs',
    ToggleVillageEditor = 'toggle_village_editor',
    SetVillageSettings = 'set_village_settings',
    UpdateVillageSendResourceThreshold = 'UpdateVillageSendResourceThreshold',
    UpdateVillageSendResourcesMultiplier = 'UpdateVillageSendResourcesMultiplier',
}

export enum Actions {
    OpenVillageEditor = 'open_village_editor',
    SaveVillageSettings = 'save_village_settings',
    ToggleVillageReceiveMode = 'toggle_village_receive_mode',
    RemoveVillageTask = 'remove_village_task',
    UpVillageTask = 'up_village_task',
    DownVillageTask = 'down_village_task',
}

export function createStore(villageFactory: VillageFactory) {
    const store = new Vuex.Store({
        state: {
            views: {
                villageEditor: false,
                logs: false,
            },
            logs: [],
            villageSettings: {
                villageId: 0,
                villageName: '',
                sendResourcesThreshold: 0,
                sendResourcesTimeout: 0,
                sendResourcesMultiplier: 0,
            },
        },
        getters: {
            reverseLogs: state => {
                return state.logs.slice().reverse();
            },
        },
        mutations: {
            [Mutations.showLogs](state) {
                state.views.logs = true;
            },
            [Mutations.hideLogs](state) {
                state.views.logs = false;
            },
            [Mutations.toggleLogs](state) {
                state.views.logs = !state.views.logs;
            },
            [Mutations.updateLogs](state, { logs }) {
                state.logs = logs;
            },
            [Mutations.ToggleVillageEditor](state, visible?: any) {
                state.views.villageEditor =
                    visible === undefined ? !state.views.villageEditor : !!visible;
            },
            [Mutations.SetVillageSettings](state, settings) {
                state.villageSettings = settings;
            },
            [Mutations.UpdateVillageSendResourceThreshold](state, value) {
                state.villageSettings.sendResourcesThreshold = getNumber(value);
            },
            [Mutations.UpdateVillageSendResourcesMultiplier](state, value) {
                state.villageSettings.sendResourcesMultiplier = getNumber(value);
            },
        },
        actions: {
            [Actions.OpenVillageEditor]({ commit }, { villageId }) {
                const state = villageFactory.createState(villageId);
                const settings = state.settings;
                commit(Mutations.SetVillageSettings, {
                    villageId: state.id,
                    villageName: state.village.name,
                    sendResourcesThreshold: settings.sendResourcesThreshold,
                    sendResourcesMultiplier: settings.sendResourcesMultiplier,
                });
                commit(Mutations.ToggleVillageEditor, true);
            },
            [Actions.SaveVillageSettings]({ state }) {
                const villageName = state.villageSettings.villageName;
                const villageId = state.villageSettings.villageId;
                const villageState = villageFactory.createState(villageId);
                const newSettings: VillageSettings = {
                    sendResourcesThreshold:
                        state.villageSettings.sendResourcesThreshold ||
                        VillageSettingsDefaults.sendResourcesThreshold,
                    sendResourcesMultiplier:
                        state.villageSettings.sendResourcesMultiplier ||
                        VillageSettingsDefaults.sendResourcesMultiplier,
                    receiveResourcesMode: villageState.settings.receiveResourcesMode,
                };
                const storage = new VillageStorage(villageId);
                storage.storeSettings(newSettings);
                notify(`Настройки для ${villageName} сохранены`);
            },
            [Actions.ToggleVillageReceiveMode]({}, { villageId }) {
                const controller = villageFactory.createController(villageId);
                controller.toggleReceiveResourcesMode();
            },
            [Actions.RemoveVillageTask]({}, { villageId, taskId }) {
                const controller = villageFactory.createController(villageId);
                controller.removeTask(taskId);
            },
            [Actions.UpVillageTask]({}, { villageId, taskId }) {
                const controller = villageFactory.createController(villageId);
                controller.upTask(taskId);
            },
            [Actions.DownVillageTask]({}, { villageId, taskId }) {
                const controller = villageFactory.createController(villageId);
                controller.downTask(taskId);
            },
        },
    });

    setInterval(() => {
        const stContainer = new StorageContainer();
        const logStorage = stContainer.logStorage;
        const logs = logStorage.getRecords();
        store.commit(Mutations.updateLogs, { logs });
    }, 1000);

    return store;
}
