import { ResourceType } from './Core/ResourceType';

export class BuildingQueueInfo {
    readonly seconds: number;
    constructor(seconds: number) {
        this.seconds = seconds;
    }
}

export class ResourceDeposit {
    readonly buildId: number;
    readonly type: ResourceType;
    readonly level: number;
    readonly ready: boolean;
    constructor(buildId: number, type: ResourceType, level: number, ready: boolean) {
        this.buildId = buildId;
        this.type = type;
        this.level = level;
        this.ready = ready;
    }
}
