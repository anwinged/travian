import { ConstructionPlan } from '../Village/VillageController';
import { ResourceType } from '../Core/ResourceType';
import { isBuildingPlanned } from '../Queue/Task';
import { UpgradeBuildingTask } from '../Handler/Task/UpgradeBuildingTask';
import { first } from '../Helpers/Collection';
import { VillageState } from '../Village/VillageState';
import { VillageTaskCollection } from '../Village/VillageTaskCollection';
import { VillageStorage } from '../Storage/VillageStorage';

export class CropBuildingPlan implements ConstructionPlan {
    constructor(
        private readonly state: VillageState,
        private readonly storage: VillageStorage,
        private readonly taskCollection: VillageTaskCollection
    ) {}

    execute() {
        const performance = this.state.performance;
        if (performance.crop >= 30) {
            return;
        }

        const resourceSlots = this.storage.getResourceSlots();
        const tasks = this.state.tasks;

        const cropSlots = resourceSlots.filter(
            (s) => s.type === ResourceType.Crop && !s.isMaxLevel
        );
        if (cropSlots.length === 0) {
            return;
        }

        // Check, if crop field is building now
        const underContraction = cropSlots.find((s) => s.isUnderConstruction);
        if (underContraction !== undefined) {
            return;
        }

        // Check, if we already have crop task in queue
        const cropBuildIds = cropSlots.map((s) => s.buildId);
        for (let buildId of cropBuildIds) {
            const upgradeTask = tasks.find(
                isBuildingPlanned(UpgradeBuildingTask.name, buildId, undefined)
            );
            if (upgradeTask !== undefined) {
                return;
            }
        }

        // Find ready for building slots and sort them by level
        cropSlots.sort((s1, s2) => s1.level - s2.level);

        const targetCropBuildId = first(cropSlots)?.buildId;
        if (!targetCropBuildId) {
            return;
        }

        this.taskCollection.addTaskAsFirst(UpgradeBuildingTask.name, {
            buildId: targetCropBuildId,
        });
    }
}
