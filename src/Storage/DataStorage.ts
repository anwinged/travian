import { Logger } from '../Logger';

const NAMESPACE = 'travian:v1';

function join(...parts: Array<string>) {
    return parts.map(p => p.replace(/[:]+$/g, '').replace(/^[:]+/g, '')).join(':');
}

export class DataStorage {
    private readonly logger;
    private readonly name: string;

    constructor(name: string) {
        this.name = name;
        this.logger = new Logger(this.constructor.name);
    }

    get(key: string): any {
        const fullKey = join(NAMESPACE, this.name, key);
        this.logger.log('GET', key);
        try {
            const serialized = localStorage.getItem(fullKey);
            return JSON.parse(serialized || '"null"');
        } catch (e) {
            if (e instanceof SyntaxError) {
                return null;
            }
            throw e;
        }
    }

    has(key: string): boolean {
        const fullKey = join(NAMESPACE, this.name, key);
        return localStorage.getItem(fullKey) !== null;
    }

    set(key: string, value: any) {
        const fullKey = join(NAMESPACE, this.name, key);
        let serialized = JSON.stringify(value);
        this.logger.log('SET', fullKey, serialized);
        localStorage.setItem(fullKey, serialized);
    }
}
