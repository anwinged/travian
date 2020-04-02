import { customAlphabet } from 'nanoid';

const smallIdGenerator = customAlphabet('1234567890abcdef', 6);

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sleepShort() {
    let ms = 3000 + Math.random() * 1000;
    console.log('SLEEP SHORT', Math.round(ms / 1000));
    return await sleep(ms);
}

export async function sleepLong() {
    let ms = 120_000 + Math.random() * 300_000;
    console.log('SLEEP LONG', Math.round(ms / 1000));
    return await sleep(ms);
}

export async function waitForLoad() {
    return new Promise(resolve => jQuery(resolve));
}

export function uniqId(): string {
    return 'id' + smallIdGenerator();
}

export function timestamp(): number {
    return Math.floor(Date.now() / 1000);
}

export function markPage(text: string, version: string) {
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
            ' ' +
            version +
            '</div>'
    );
}
