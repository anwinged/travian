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
