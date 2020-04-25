import { Resources } from './Resources';

export class IncomingMerchant {
    readonly resources: Resources;
    readonly ts: number;
    constructor(resources: Resources, ts: number) {
        this.resources = resources;
        this.ts = ts;
    }
}
