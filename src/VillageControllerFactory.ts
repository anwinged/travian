import { VillageController } from './VillageController';
import { VillageStorage } from './Storage/VillageStorage';
import { VillageRepository } from './VillageRepository';

export class VillageControllerFactory {
    private villageRepository: VillageRepository;

    constructor(villageRepository: VillageRepository) {
        this.villageRepository = villageRepository;
    }

    create(villageId: number): VillageController {
        const village = this.villageRepository.get(villageId);
        return new VillageController(village.id, new VillageStorage(village.id));
    }

    getActive(): VillageController {
        const village = this.villageRepository.getActive();
        return this.create(village.id);
    }
}
