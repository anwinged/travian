import { ConsoleLogger, Logger, NullLogger } from './Logger';

const NAMESPACE = 'travian:v1';

const storage = localStorage;

function join(...parts: Array<string>) {
    return parts.map(p => p.replace(/[:]+$/g, '').replace(/^[:]+/g, '')).join(':');
}

export class DataStorage {
    private readonly logger: Logger;
    private readonly name: string;

    constructor(name: string) {
        this.name = name;
        // this.logger = new ConsoleLogger(this.constructor.name);
        this.logger = new NullLogger();
    }

    static onChange(handler: (key: string) => void) {
        window.addEventListener('storage', ({ key, storageArea }) => {
            if (storageArea === storage) {
                handler(key || '');
            }
        });
    }

    get(key: string): any {
        const fullKey = join(NAMESPACE, this.name, key);
        try {
            const serialized = storage.getItem(fullKey);
            this.logger.log('GET', fullKey, serialized);
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
        return storage.getItem(fullKey) !== null;
    }

    set(key: string, value: any) {
        const fullKey = join(NAMESPACE, this.name, key);
        let serialized = JSON.stringify(value);
        this.logger.log('SET', fullKey, serialized);
        storage.setItem(fullKey, serialized);
    }
}
