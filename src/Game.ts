export enum ResourceType {
    Lumber = 1,
    Clay = 2,
    Iron = 3,
    Crop = 4,
}

export const ResourceMapping: ReadonlyArray<{ num: number; type: ResourceType }> = [
    { num: 1, type: ResourceType.Lumber },
    { num: 2, type: ResourceType.Clay },
    { num: 3, type: ResourceType.Iron },
    { num: 4, type: ResourceType.Crop },
];

export function numberToResourceType(typeAsNumber: number): ResourceType {
    for (let mp of ResourceMapping) {
        if (typeAsNumber === mp.num) {
            return mp.type;
        }
    }
    throw new Error(`Type ${typeAsNumber} in not valid`);
}

export type ResourceList = Array<{ num: number; type: ResourceType; value: number }>;

export interface ResourcesInterface {
    lumber: number;
    clay: number;
    iron: number;
    crop: number;
}

export class Resources implements ResourcesInterface {
    readonly lumber: number;
    readonly clay: number;
    readonly iron: number;
    readonly crop: number;
    constructor(lumber: number, clay: number, iron: number, crop: number) {
        this.lumber = lumber;
        this.clay = clay;
        this.iron = iron;
        this.crop = crop;
    }

    getByType(type: ResourceType): number {
        switch (type) {
            case ResourceType.Lumber:
                return this.lumber;
            case ResourceType.Clay:
                return this.clay;
            case ResourceType.Iron:
                return this.iron;
            case ResourceType.Crop:
                return this.crop;
        }
    }

    asList(): ResourceList {
        const result: ResourceList = [];
        for (let mp of ResourceMapping) {
            result.push({ num: mp.num, type: mp.type, value: this.getByType(mp.type) });
        }
        return result;
    }
}

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
