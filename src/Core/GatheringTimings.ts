import { Resources } from './Resources';

type GatheringPlain = number | 'never';

enum GatheringType {
    Counting,
    Never,
}

export class GatheringTime {
    private readonly _type: GatheringType;
    private readonly _seconds: number;

    static makeNever(): GatheringTime {
        return new GatheringTime(GatheringType.Never, 0);
    }

    static makeCounting(value: number): GatheringTime {
        return new GatheringTime(GatheringType.Counting, value);
    }

    constructor(type: GatheringType, seconds: number) {
        this._type = type;
        this._seconds = seconds;
    }

    get never(): boolean {
        return this._type === GatheringType.Never;
    }

    get seconds(): number {
        if (this.never) {
            throw new Error('Never');
        }
        return this._seconds;
    }
}

export class GatheringTimings {
    readonly lumber: GatheringTime;
    readonly clay: GatheringTime;
    readonly iron: GatheringTime;
    readonly crop: GatheringTime;

    static create(
        lumber: GatheringPlain,
        clay: GatheringPlain,
        iron: GatheringPlain,
        crop: GatheringPlain
    ): GatheringTimings {
        const factory = (p: GatheringPlain) =>
            p === 'never' ? GatheringTime.makeNever() : GatheringTime.makeCounting(p);
        return new GatheringTimings(factory(lumber), factory(clay), factory(iron), factory(crop));
    }

    constructor(lumber: GatheringTime, clay: GatheringTime, iron: GatheringTime, crop: GatheringTime) {
        this.lumber = lumber;
        this.clay = clay;
        this.iron = iron;
        this.crop = crop;
    }

    get slowest(): GatheringTime {
        const xs = [this.lumber, this.clay, this.iron, this.crop];
        const init = new GatheringTime(GatheringType.Counting, 0);
        return xs.reduce(
            (m, t) =>
                m.never || t.never
                    ? GatheringTime.makeNever()
                    : GatheringTime.makeCounting(Math.max(m.seconds, t.seconds)),
            init
        );
    }

    get fastest(): GatheringTime {
        const xs = [this.lumber, this.clay, this.iron, this.crop];
        const init = new GatheringTime(GatheringType.Counting, Number.MAX_SAFE_INTEGER);
        return xs.reduce(
            (m, t) =>
                m.never || t.never
                    ? GatheringTime.makeNever()
                    : GatheringTime.makeCounting(Math.min(m.seconds, t.seconds)),
            init
        );
    }
}

function calcGatheringTime(val: number, desired: number, speed: number): GatheringTime {
    const diff = desired - val;
    if (diff > 0 && speed <= 0) {
        return GatheringTime.makeNever();
    }
    if (diff <= 0) {
        return GatheringTime.makeCounting(0);
    }

    return GatheringTime.makeCounting((diff / speed) * 3600);
}

export function calcGatheringTimings(resources: Resources, desired: Resources, speed: Resources): GatheringTimings {
    return new GatheringTimings(
        calcGatheringTime(resources.lumber, desired.lumber, speed.lumber),
        calcGatheringTime(resources.clay, desired.clay, speed.clay),
        calcGatheringTime(resources.iron, desired.iron, speed.iron),
        calcGatheringTime(resources.crop, desired.crop, speed.crop)
    );
}
