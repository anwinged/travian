import { ResourceType } from './Core/ResourceType';

export class ResourceStorage {
    readonly warehouse: number;
    readonly granary: number;
    constructor(warehouse: number, granary: number) {
        this.warehouse = warehouse;
        this.granary = granary;
    }
}

export class Coordinates {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class Village {
    readonly id: number;
    readonly name: string;
    readonly active: boolean;
    readonly crd: Coordinates;
    constructor(id: number, name: string, active: boolean, crd: Coordinates) {
        this.id = id;
        this.name = name;
        this.active = active;
        this.crd = crd;
    }
}

export type VillageList = Array<Village>;

export class BuildingQueueInfo {
    readonly seconds: number;
    constructor(seconds: number) {
        this.seconds = seconds;
    }
}

export class HeroAttributes {
    readonly health: number;
    constructor(health: number) {
        this.health = health;
    }
}

export type HeroAllResourcesType = 'all';
export const HeroAllResources: HeroAllResourcesType = 'all';

export type HeroResourceType = ResourceType | HeroAllResourcesType;

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
