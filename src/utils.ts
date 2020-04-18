import * as URLParse from 'url-parse';

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sleepMicro() {
    let ms = 1000 + Math.random() * 1000;
    console.log('SLEEP SHORT', Math.round(ms / 1000));
    return await sleep(ms);
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

export function aroundMinutes(minutes: number) {
    const seconds = minutes * 60;
    const delta = Math.floor(seconds * 0.9);
    return seconds - delta + Math.floor(Math.random() * 2 * delta);
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

export function uniqId(): string {
    return 'id' + generateId(6);
}

export function timestamp(): number {
    return Math.floor(Date.now() / 1000);
}

export function trimPrefix(text: string, prefix: string): string {
    return text.startsWith(prefix) ? text.substr(prefix.length) : text;
}

export function elClassId(classes: string, prefix: string): number | undefined {
    let result: number | undefined = undefined;
    classes.split(/\s/).forEach(part => {
        if (part.startsWith(prefix)) {
            result = Number(part.substr(prefix.length));
            if (isNaN(result)) {
                result = undefined;
            }
        }
    });
    return result;
}

export function* split(n: number) {
    let c = n;
    while (c > 0) {
        const next = 2 + Math.floor(Math.random() * 3);
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
        .replace('−‭', '-')
        .replace(/[^0-9-]/gi, '');
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

export function path(p: string, query: { [key: string]: string | number | undefined } = {}) {
    let parts: string[] = [];
    for (let k in query) {
        if (query[k] !== undefined) {
            parts.push(`${k}=${query[k]}`);
        }
    }
    return p + (parts.length ? '?' + parts.join('&') : '');
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
