export function randomInRange(from: number, to: number): number {
    const delta = to - from;
    const variation = Math.random() * delta;
    return Math.floor(from + variation);
}

export function around(value: number, koeff: number): number {
    const delta = Math.floor(value * koeff);
    return randomInRange(value - delta, value + delta);
}
