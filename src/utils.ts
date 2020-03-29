export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sleepShort() {
    let ms = 2000 + Math.random() * 10000;
    console.log('SLEEp SHORT', Math.round(ms));
    return await sleep(ms);
}

export async function sleepLong() {
    let ms = 10000 + Math.random() * 10000;
    console.log('SLEEP LONG', Math.round(ms));
    return await sleep(ms);
}
