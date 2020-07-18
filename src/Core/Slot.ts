import { ResourceType } from './ResourceType';

export interface Slot {
    readonly buildId: number;
    readonly level: number;
    readonly isReady: boolean;
    readonly isUnderConstruction: boolean;
    readonly isMaxLevel: boolean;
}

export interface ResourceSlot extends Slot {
    readonly type: ResourceType;
}

export const ResourceSlotDefaults: ResourceSlot = {
    type: ResourceType.Lumber,
    buildId: 0,
    level: 0,
    isReady: false,
    isUnderConstruction: false,
    isMaxLevel: false,
};

export interface BuildingSlot extends Slot {
    readonly buildTypeId: number;
}

export const BuildingSlotDefaults: BuildingSlot = {
    buildTypeId: 0,
    buildId: 0,
    level: 0,
    isReady: false,
    isUnderConstruction: false,
    isMaxLevel: false,
};
