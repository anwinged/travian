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
