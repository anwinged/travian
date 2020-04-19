import { ResourcesInterface } from './Game';
import { TaskId } from './Queue/TaskQueue';

export interface Args {
    villageId?: number;
    buildId?: number;
    categoryId?: number;
    buildTypeId?: number;
    resources?: ResourcesInterface;
    taskId?: TaskId;
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
