import { VillageController } from './VillageController';
import { VillageStorage } from './Storage/VillageStorage';
import { VillageRepository } from './VillageRepository';
import { VillageTaskCollection } from './VillageTaskCollection';
import { VillageState, VillageStateFactory } from './VillageState';
import { Village } from './Core/Village';

export class VillageFactory {
    private readonly villageRepository: VillageRepository;

    constructor(villageRepository: VillageRepository) {
        this.villageRepository = villageRepository;
    }

    getAllVillages(): Array<Village> {
        return this.villageRepository.all();
    }

    getVillage(villageId: number): Village {
        return this.villageRepository.get(villageId);
    }

    createStorage(villageId: number): VillageStorage {
        const village = this.villageRepository.get(villageId);
        return new VillageStorage(village.id);
    }

    createStorageForActiveVillage(): VillageStorage {
        const village = this.villageRepository.getActive();
        return this.createStorage(village.id);
    }

    createTaskCollection(villageId: number): VillageTaskCollection {
        const village = this.villageRepository.get(villageId);
        return new VillageTaskCollection(village.id, this.createStorage(villageId));
    }

    createTaskCollectionForActiveVillage(): VillageTaskCollection {
        const village = this.villageRepository.getActive();
        return this.createTaskCollection(village.id);
    }

    createState(villageId: number): VillageState {
        const village = this.villageRepository.get(villageId);
        const stateFactory = new VillageStateFactory(
            this.villageRepository,
            (id: number) => this.createStorage(id),
            (id: number) => this.createTaskCollection(id)
        );
        return stateFactory.getVillageState(village.id);
    }

    getAllVillageStates(): Array<VillageState> {
        const stateFactory = new VillageStateFactory(
            this.villageRepository,
            (id: number) => this.createStorage(id),
            (id: number) => this.createTaskCollection(id)
        );
        return stateFactory.getAllVillageStates();
    }

    createController(villageId: number): VillageController {
        const village = this.villageRepository.get(villageId);
        return new VillageController(village.id, this.createTaskCollection(village.id), this.createState(village.id));
    }
}
