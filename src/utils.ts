import * as URLParse from 'url-parse';

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomInRange(from: number, to: number): number {
    const delta = to - from;
    const variation = Math.random() * delta;
    return Math.floor(from + variation);
}

export function around(value: number, koeff: number): number {
    const delta = Math.floor(value * koeff);
    return randomInRange(value - delta, value + delta);
}

export async function sleepMicro() {
    const timeInMs = randomInRange(1500, 2500);
    return await sleep(timeInMs);
}

export function aroundMinutes(minutes: number) {
    const seconds = minutes * 60;
    return around(seconds, 0.1);
}

export async function waitForLoad() {
    return new Promise(resolve => jQuery(resolve));
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz1234567890';
const ALPHABET_LENGTH = ALPHABET.length - 1;

function generateId(count: number): string {
    let str = '';
    for (let i = 0; i < count; ++i) {
        let symbolIndex = Math.floor(Math.random() * ALPHABET_LENGTH);
        str += ALPHABET[symbolIndex];
    }
    return str;
}

export function uniqId(prefix: string = 'id'): string {
    return prefix + generateId(6);
}

export function timestamp(): number {
    return Math.floor(Date.now() / 1000);
}

export function trimPrefix(text: string, prefix: string): string {
    return text.startsWith(prefix) ? text.substr(prefix.length) : text;
}

export function elClassId(classes: string | undefined, prefix: string): number | undefined {
    if (classes === undefined) {
        return undefined;
    }
    let result: number | undefined = undefined;
    classes.split(/\s/).forEach(part => {
        const match = part.match(new RegExp(prefix + '(\\d+)'));
        if (match) {
            result = toNumber(match[1]);
        }
    });
    return result;
}

export function* split(n: number, from: number = 2, to: number = 6) {
    let c = n;
    while (c > 0) {
        const next = from + Math.floor(Math.random() * (to - from));
        if (next < c) {
            yield next;
            c -= next;
        } else {
            yield c;
            c = 0;
        }
    }
}

export function toNumber(value: any): number | undefined {
    const normalized = String(value)
        .replace('\u2212', '\u002d') // minus to hyphen-minus
        .replace(/[^0-9\u002d]/g, '');
    const converted = Number(normalized);
    return isNaN(converted) ? undefined : converted;
}

export function getNumber(value: any, def: number = 0): number {
    const converted = toNumber(value);
    return converted === undefined ? def : converted;
}

export function parseLocation(location?: string | undefined) {
    return new URLParse(location || window.location.href, true);
}

export function notify(msg: string): void {
    const n = new Notification(msg);
    setTimeout(() => n && n.close(), 4000);
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
