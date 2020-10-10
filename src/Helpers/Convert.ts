export function trimPrefix(text: string, prefix: string): string {
    return text.startsWith(prefix) ? text.substr(prefix.length) : text;
}

export function elClassId(classes: string | undefined, prefix: string): number | undefined {
    if (classes === undefined) {
        return undefined;
    }
    let result: number | undefined = undefined;
    classes.split(/\s/).forEach((part) => {
        const match = part.match(new RegExp(prefix + '(\\d+)'));
        if (match) {
            result = toNumber(match[1]);
        }
    });
    return result;
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
