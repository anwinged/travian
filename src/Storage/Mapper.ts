interface EmptyObjectFactory<T> {
    (): T;
}

interface ObjectMapper<T> {
    (item: any): T;
}

export interface ObjectMapperOptions<T> {
    factory?: EmptyObjectFactory<T>;
    mapper?: ObjectMapper<T>;
}

export function createMapper<T>(options: ObjectMapperOptions<T>): ObjectMapper<T> {
    const { mapper, factory } = options;

    if (mapper) {
        return mapper;
    }

    if (factory) {
        return (plain) => {
            let item = factory();
            if (typeof plain === 'object' && typeof item === 'object') {
                return Object.assign(item, plain) as T;
            } else {
                return item;
            }
        };
    }

    throw new Error('Factory or mapper must be specified');
}
