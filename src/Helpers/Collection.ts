import * as _ from 'underscore';

export function first<T>(items: ReadonlyArray<T>): T | undefined {
    return _.first(items);
}
