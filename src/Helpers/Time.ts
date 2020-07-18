import { around, randomInRange } from './Random';

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sleepMicro() {
    const timeInMs = randomInRange(1500, 2500);
    return await sleep(timeInMs);
}

export function timestamp(): number {
    return Math.floor(Date.now() / 1000);
}

export function aroundMinutes(minutes: number) {
    const seconds = minutes * 60;
    return around(seconds, 0.1);
}
