export interface CoordinatesInterface {
    x: number;
    y: number;
}

export class Coordinates implements CoordinatesInterface {
    readonly x: number;
    readonly y: number;

    static fromObject(crd: CoordinatesInterface) {
        return new Coordinates(crd.x, crd.y);
    }

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    eq(other: CoordinatesInterface): boolean {
        return this.x === other.x && this.y === other.y;
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

// export interface VillageSettings {
//     id: number;
//
// }
