const NAMESPACE = 'game_state:v1';

function join(x: string, y: string) {
    return x.replace(/[:]+$/g, '') + ':' + y.replace(/^[:]+/g, '');
}

export class GameState {
    get(key: string): any {
        this.log('GET', key);
        try {
            const serialized = localStorage.getItem(join(NAMESPACE, key));
            return JSON.parse(serialized || 'null');
        } catch (e) {
            if (e instanceof SyntaxError) {
                return null;
            }
            throw e;
        }
    }

    has(key: string): boolean {
        return localStorage.getItem(join(NAMESPACE, key)) === null;
    }

    set(key: string, value: any) {
        let serialized = JSON.stringify(value);
        this.log('SET', key, serialized);
        localStorage.setItem(join(NAMESPACE, key), serialized);
    }

    private log(...args) {
        console.log('GAME STATE:', ...args);
    }
}
