import * as dateFormat from 'dateformat';

export function formatDate(ts: number, format: string = 'HH:MM:ss') {
    const d = new Date(ts * 1000);
    return dateFormat(d, format);
}
