import { VillageTaskCollection } from '../VillageTaskCollection';
import { VillageStorage } from '../Storage/VillageStorage';

export abstract class Grabber {
    protected taskCollection: VillageTaskCollection;
    protected storage: VillageStorage;

    constructor(taskCollection: VillageTaskCollection, storage: VillageStorage) {
        this.taskCollection = taskCollection;
        this.storage = storage;
    }

    abstract grab(): void;
}
