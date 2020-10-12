import { ConstructionPlan } from '../Village/VillageController';
import { isBuildingPlanned } from '../Queue/Task';
import { UpgradeBuildingTask } from '../Handler/Task/UpgradeBuildingTask';
import { first } from '../Helpers/Collection';
import { TaskState, VillageState } from '../Village/VillageState';
import { VillageTaskCollection } from '../Village/VillageTaskCollection';
import { VillageStorage } from '../Storage/VillageStorage';
import { BuildingSlot } from '../Core/Slot';

export class WarehouseBuildingPlan implements ConstructionPlan {
    constructor(
        private readonly buildTypeId: number,
        private readonly checkNeedEnlargeFunc: (task: TaskState) => boolean,
        private readonly state: VillageState,
        private readonly storage: VillageStorage,
        private readonly taskCollection: VillageTaskCollection
    ) {}

    execute() {
        const storageSlots = this.findStorageSlots();
        if (storageSlots.length === 0) {
            return;
        }

        // Check, if warehouse is building now
        const underConstructionSlot = storageSlots.find((s) => s.isUnderConstruction);
        if (underConstructionSlot !== undefined) {
            return;
        }

        if (this.isWarehouseInBuildingQueue(storageSlots)) {
            return;
        }

        const needStorageEnlargeTasks = this.state.tasks.filter(this.checkNeedEnlargeFunc);
        if (needStorageEnlargeTasks.length === 0) {
            return;
        }

        const firstSlot = first(storageSlots);
        if (firstSlot) {
            this.taskCollection.addTask(UpgradeBuildingTask.name, {
                buildId: firstSlot.buildId,
                buildTypeId: this.buildTypeId,
            });
        }
    }

    private findStorageSlots() {
        const buildingSlots = this.storage.getBuildingSlots();

        return buildingSlots.filter(
            (slot) => slot.buildTypeId === this.buildTypeId && !slot.isMaxLevel
        );
    }

    private isWarehouseInBuildingQueue(storageSlots: ReadonlyArray<BuildingSlot>): boolean {
        const storageBuildIds = storageSlots.map((slot) => slot.buildId);
        for (let buildId of storageBuildIds) {
            const upgradeTask = this.state.tasks.find(
                isBuildingPlanned(UpgradeBuildingTask.name, buildId, this.buildTypeId)
            );
            if (upgradeTask !== undefined) {
                return true;
            }
        }

        return false;
    }
}
