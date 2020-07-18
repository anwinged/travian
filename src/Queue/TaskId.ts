import { uniqId } from '../Helpers/Identity';

export type TaskId = string;

let idSequence = 1;
let lastTimestamp: number | undefined = undefined;

export function uniqTaskId(): TaskId {
    const ts = Math.floor(Date.now() / 1000);
    if (ts === lastTimestamp) {
        ++idSequence;
    } else {
        idSequence = 1;
    }
    lastTimestamp = ts;
    return 'tid.' + ts + '.' + String(idSequence).padStart(4, '0') + '.' + uniqId('');
}
