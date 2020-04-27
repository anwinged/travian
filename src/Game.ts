import { ResourceType } from './Core/ResourceType';

export class BuildingQueueInfo {
    readonly seconds: number;
    constructor(seconds: number) {
        this.seconds = seconds;
    }
}

export interface ResourceDeposit {
    readonly buildId: number;
    readonly type: ResourceType;
    readonly level: number;
    readonly ready: boolean;
    readonly underConstruction: boolean;
}
