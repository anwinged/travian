import Vuex from 'vuex';
import { LogStorage } from '../Storage/LogStorage';
import { VillageStateRepository } from '../VillageState';
import { VillageSettings, VillageSettingsDefaults } from '../Core/Village';
import { getNumber, notify } from '../utils';
import { VillageStorage } from '../Storage/VillageStorage';

export enum Mutations {
    showLogs = 'showLogs',
    hideLogs = 'hideLogs',
    toggleLogs = 'toggleLogs',
    updateLogs = 'updateLogs',
    ToggleVillageEditor = 'toggle_village_editor',
    SetVillageSettings = 'set_village_settings',
    UpdateVillageSendResourceThreshold = 'UpdateVillageSendResourceThreshold',
    UpdateVillageSendResourceTimeout = 'UpdateVillageSendResourceTimeout',
    UpdateVillageSendResourcesMultiplier = 'UpdateVillageSendResourcesMultiplier',
}

export enum Actions {
    OpenVillageEditor = 'open_village_editor',
    SaveVillageSettings = 'save_village_settings',
}

export function createStore(villageStateRepository: VillageStateRepository) {
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
                state.views.villageEditor = visible === undefined ? !state.views.villageEditor : !!visible;
            },
            [Mutations.SetVillageSettings](state, settings) {
                state.villageSettings = settings;
            },
            [Mutations.UpdateVillageSendResourceThreshold](state, value) {
                state.villageSettings.sendResourcesThreshold = getNumber(value);
            },
            [Mutations.UpdateVillageSendResourceTimeout](state, value) {
                state.villageSettings.sendResourcesTimeout = getNumber(value);
            },
            [Mutations.UpdateVillageSendResourcesMultiplier](state, value) {
                state.villageSettings.sendResourcesMultiplier = getNumber(value);
            },
        },
        actions: {
            [Actions.OpenVillageEditor]({ commit }, { villageId }) {
                const state = villageStateRepository.getVillageState(villageId);
                const settings = state.settings;
                commit(Mutations.SetVillageSettings, {
                    villageId: state.id,
                    villageName: state.village.name,
                    sendResourcesThreshold: settings.sendResourcesThreshold,
                    sendResourcesTimeout: settings.sendResourcesTimeout,
                    sendResourcesMultiplier: settings.sendResourcesMultiplier,
                });
                commit(Mutations.ToggleVillageEditor, true);
            },
            [Actions.SaveVillageSettings]({ state }) {
                const villageId = state.villageSettings.villageId;
                const villageName = state.villageSettings.villageName;
                const newSettings: VillageSettings = {
                    sendResourcesThreshold:
                        state.villageSettings.sendResourcesThreshold || VillageSettingsDefaults.sendResourcesThreshold,
                    sendResourcesTimeout:
                        state.villageSettings.sendResourcesTimeout || VillageSettingsDefaults.sendResourcesTimeout,
                    sendResourcesMultiplier:
                        state.villageSettings.sendResourcesMultiplier ||
                        VillageSettingsDefaults.sendResourcesMultiplier,
                };
                const storage = new VillageStorage(villageId);
                storage.storeSettings(newSettings);
                notify(`Настройки для ${villageName} сохранены`);
            },
        },
    });

    setInterval(() => {
        const logStorage = new LogStorage();
        const logs = logStorage.getRecords();
        store.commit(Mutations.updateLogs, { logs });
    }, 1000);

    return store;
}
