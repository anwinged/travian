import { ResourceList, ResourceMapping, ResourceType } from './ResourceType';
import { ResourceStorage } from './ResourceStorage';

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
        this.lumber = Math.floor(lumber);
        this.clay = Math.floor(clay);
        this.iron = Math.floor(iron);
        this.crop = Math.floor(crop);
    }

    static fromObject(obj: ResourcesInterface): Resources {
        return new Resources(obj.lumber, obj.clay, obj.iron, obj.crop);
    }

    static fromStorage(storage: ResourceStorage): Resources {
        return new Resources(storage.warehouse, storage.warehouse, storage.warehouse, storage.granary);
    }

    static zero(): Resources {
        return new Resources(0, 0, 0, 0);
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

    scale(n: number): Resources {
        return new Resources(this.lumber * n, this.clay * n, this.iron * n, this.crop * n);
    }

    add(other: ResourcesInterface): Resources {
        return new Resources(
            this.lumber + other.lumber,
            this.clay + other.clay,
            this.iron + other.iron,
            this.crop + other.crop
        );
    }

    sub(other: ResourcesInterface): Resources {
        return new Resources(
            this.lumber - other.lumber,
            this.clay - other.clay,
            this.iron - other.iron,
            this.crop - other.crop
        );
    }

    eq(other: ResourcesInterface): boolean {
        return (
            this.lumber === other.lumber &&
            this.clay === other.clay &&
            this.iron === other.iron &&
            this.crop === other.crop
        );
    }

    lt(other: ResourcesInterface): boolean {
        return this.lumber < other.lumber || this.clay < other.clay || this.iron < other.iron || this.crop < other.crop;
    }

    gt(other: ResourcesInterface): boolean {
        return this.lumber > other.lumber && this.clay > other.clay && this.iron > other.iron && this.crop > other.crop;
    }

    min(other: ResourcesInterface): Resources {
        return new Resources(
            Math.min(this.lumber, other.lumber),
            Math.min(this.clay, other.clay),
            Math.min(this.iron, other.iron),
            Math.min(this.crop, other.crop)
        );
    }

    max(other: ResourcesInterface): Resources {
        return new Resources(
            Math.max(this.lumber, other.lumber),
            Math.max(this.clay, other.clay),
            Math.max(this.iron, other.iron),
            Math.max(this.crop, other.crop)
        );
    }
}
