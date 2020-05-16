import Vuex from 'vuex';
import { StorageLogRecord } from '../Logger';
import { LogStorage } from '../Storage/LogStorage';

export enum Mutations {
    showLogs = 'showLogs',
    hideLogs = 'hideLogs',
    updateLogs = 'updateLogs',
}

export function createStore() {
    const store = new Vuex.Store({
        state: {
            views: {
                logs: false,
            },
            logs: [],
        },
        mutations: {
            [Mutations.showLogs](state) {
                state.views.logs = true;
            },
            [Mutations.hideLogs](state) {
                state.views.logs = false;
            },
            [Mutations.updateLogs](state, { logs }) {
                state.logs = logs;
            },
        },
        getters: {
            reverseLogs: state => {
                return state.logs.slice().reverse();
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
