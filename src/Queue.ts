export class QueueItem {
    readonly name: string;

    readonly args;

    constructor(name: string, args: { [name: string]: any }) {
        this.name = name;
        this.args = args;
    }
}

export class Queue {
    private readonly name;

    constructor(name: string) {
        this.name = name;
    }

    pop() {
        const serialized = localStorage.getItem(this.name);
        if (serialized === null) {
            return null;
        }
        const items = JSON.parse(serialized) as Array<QueueItem>;
        if (items.length === 0) {
            return null;
        }
        const first = items.shift();

        this.flush(items);

        if (first === undefined) {
            return null;
        }

        return new QueueItem(first.name || '', first.args || {});
    }

    push(item: QueueItem): void {
        const serialized = localStorage.getItem(this.name);
        const items = serialized
            ? (JSON.parse(serialized) as Array<QueueItem>)
            : [];
        items.push(item);
        this.flush(items);
    }

    private flush(items) {
        console.log('SET NEW QUEUE', this.name, items);
        localStorage.setItem(this.name, JSON.stringify(items));
    }
}
