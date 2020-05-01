import { DataStorage } from '../DataStorage';
import { ExecutionSettings } from '../Executor';

const NAMESPACE = 'execution.v1';

const SETTINGS_KEY = 'settings';

export class ExecutionStorage {
    private storage: DataStorage;
    constructor() {
        this.storage = new DataStorage(NAMESPACE);
    }

    getExecutionSettings(): ExecutionSettings {
        return this.storage.getTyped<ExecutionSettings>(SETTINGS_KEY, {
            factory: () => ({ pauseTs: 0 }),
        });
    }

    setExecutionSettings(statistics: ExecutionSettings): void {
        this.storage.set(SETTINGS_KEY, statistics);
    }
}
