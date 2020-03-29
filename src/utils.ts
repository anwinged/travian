export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sleepShort() {
    let ms = 2000 + Math.random() * 1000;
    console.log('SLEEP SHORT', Math.round(ms));
    return await sleep(ms);
}

export async function sleepLong() {
    let ms = 30_000 + Math.random() * 120_000;
    console.log('SLEEP LONG', Math.round(ms));
    return await sleep(ms);
}

export function markPage(text: string) {
    jQuery('body').append(
        '<div style="' +
            'position: absolute; ' +
            'top: 0; left: 0; ' +
            'background-color: white; ' +
            'font-size: 24px; ' +
            'z-index: 9999; ' +
            'padding: 8px 6px; ' +
            'color: black">' +
            text +
            '</div>'
    );
}
