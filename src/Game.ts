import { ResourceType } from './Core/ResourceType';

export class BuildingQueueInfo {
    readonly seconds: number;
    constructor(seconds: number) {
        this.seconds = seconds;
    }
}

export interface ResourceSlot {
    readonly buildId: number;
    readonly type: ResourceType;
    readonly level: number;
    readonly isReady: boolean;
    readonly isUnderConstruction: boolean;
    readonly isMaxLevel: boolean;
}

export const ResourceSlotDefaults: ResourceSlot = {
    buildId: 0,
    type: ResourceType.Lumber,
    level: 0,
    isReady: false,
    isUnderConstruction: false,
    isMaxLevel: false,
};
