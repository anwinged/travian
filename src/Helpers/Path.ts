export interface PathQuery {
    [key: string]: string | number | undefined;
}

export interface PathDefinition {
    name: string;
    query: PathQuery;
}

export type PathList = Array<PathDefinition>;

export function path(base: string, query: PathQuery = {}): string {
    let parts: string[] = [];
    for (let name of Object.keys(query)) {
        if (query[name] !== undefined) {
            parts.push(`${name}=${query[name]}`);
        }
    }
    return base + (parts.length ? '?' + parts.join('&') : '');
}

export function uniqPaths(paths: PathList): PathList {
    const keys: { [k: string]: boolean | undefined } = {};
    const result: PathList = [];
    for (let path of paths) {
        const pathKey = JSON.stringify(path);
        if (keys[pathKey]) {
            continue;
        }
        keys[pathKey] = true;
        result.push(path);
    }
    return result;
}
