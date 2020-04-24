import { Resources } from './Resources';

type GatheringNever = 'never';
type GatheringTime = number | GatheringNever;

export class GatheringTimings {
    readonly lumber: GatheringTime;
    readonly clay: GatheringTime;
    readonly iron: GatheringTime;
    readonly crop: GatheringTime;

    constructor(lumber: GatheringTime, clay: GatheringTime, iron: GatheringTime, crop: GatheringTime) {
        this.lumber = lumber;
        this.clay = clay;
        this.iron = iron;
        this.crop = crop;
    }

    private get common(): GatheringTime {
        const xs = [this.lumber, this.clay, this.iron, this.crop];
        return xs.reduce((m, t) => (m === 'never' || t === 'never' ? 'never' : Math.max(m, t)), 0);
    }

    get hours(): number {
        const common = this.common;
        if (common === 'never') {
            throw Error('Never');
        }
        return common;
    }

    get never(): boolean {
        return this.common === 'never';
    }
}

function calcGatheringTime(val: number, desired: number, speed: number): GatheringTime {
    const diff = desired - val;
    if (diff > 0 && speed <= 0) {
        return 'never';
    }
    if (diff <= 0) {
        return 0;
    }

    return diff / speed;
}

export function calcGatheringTimings(resources: Resources, desired: Resources, speed: Resources): GatheringTimings {
    return new GatheringTimings(
        calcGatheringTime(resources.lumber, desired.lumber, speed.lumber),
        calcGatheringTime(resources.clay, desired.clay, speed.clay),
        calcGatheringTime(resources.iron, desired.iron, speed.iron),
        calcGatheringTime(resources.crop, desired.crop, speed.crop)
    );
}
