export interface Args {
    villageId?: number;
    buildId?: number;
    categoryId?: number;
    buildTypeId?: number;
    [name: string]: any;
}

export class Command {
    readonly name: string;
    readonly args: Args;

    constructor(name: string, args: Args) {
        this.name = name;
        this.args = args;
    }
}
