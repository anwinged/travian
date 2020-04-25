import { ConsoleLogger, Logger, NullLogger } from './Logger';
import { Resources } from './Core/Resources';

const NAMESPACE = 'travian:v1';

const storage = localStorage;

function join(...parts: Array<string>) {
    return parts.map(p => p.replace(/[:]+$/g, '').replace(/^[:]+/g, '')).join(':');
}

interface EmptyObjectFactory<T> {
    (): T;
}

interface ObjectMapper<T> {
    (item: any): T;
}

interface ObjectMapperOptions<T> {
    factory?: EmptyObjectFactory<T>;
    mapper?: ObjectMapper<T>;
}

function createMapper<T>(options: ObjectMapperOptions<T>): ObjectMapper<T> {
    const { mapper, factory } = options;

    if (mapper) {
        return mapper;
    }

    if (factory) {
        return plain => {
            let item = factory();
            return Object.assign(item, plain) as T;
        };
    }

    throw new Error('Factory or mapper must be specified');
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

    getTyped<T>(key: string, options: ObjectMapperOptions<T> = {}): T {
        let plain = this.get(key);
        const mapper = createMapper(options);
        return mapper(plain);
    }

    getTypedList<T>(key: string, options: ObjectMapperOptions<T> = {}): Array<T> {
        let plain = this.get(key);
        if (!Array.isArray(plain)) {
            return [];
        }
        const mapper = createMapper(options);
        return (plain as Array<any>).map(mapper);
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
