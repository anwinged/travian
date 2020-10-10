import { VillageController } from './VillageController';
import { VillageStorage } from '../Storage/VillageStorage';
import { VillageRepositoryInterface } from './VillageRepository';
import { VillageTaskCollection } from './VillageTaskCollection';
import { VillageState, VillageStateFactory } from './VillageState';
import { Village } from '../Core/Village';

export class VillageFactory {
    constructor(private readonly villageRepository: VillageRepositoryInterface) {}

    getById(villageId: number): IntVillageFactory {
        return this.makeInternalFactory(this.villageRepository.getById(villageId));
    }

    active(): IntVillageFactory {
        return this.makeInternalFactory(this.villageRepository.getActive());
    }

    private makeInternalFactory(village: Village): IntVillageFactory {
        return new IntVillageFactory(village, new VillageStateFactory());
    }

    getAllVillages(): Array<Village> {
        return this.villageRepository.all();
    }

    getAllVillageStates(): Array<VillageState> {
        return this.villageRepository
            .all()
            .map((village) => this.makeInternalFactory(village).state());
    }
}

class IntVillageFactory {
    constructor(
        private readonly village: Village,
        private readonly stateFactory: VillageStateFactory
    ) {}

    short(): Village {
        return this.village;
    }

    storage(): VillageStorage {
        return new VillageStorage(this.village.id);
    }

    taskCollection(): VillageTaskCollection {
        return new VillageTaskCollection(this.village.id, this.storage());
    }

    state(): VillageState {
        return this.stateFactory.getVillageState(this.village, this.storage());
    }

    controller(): VillageController {
        return new VillageController(
            this.village.id,
            this.storage(),
            this.taskCollection(),
            this.state()
        );
    }
}
