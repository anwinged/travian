import { ResourcesInterface } from './Game';
import { TaskId } from './Queue/TaskQueue';

export interface Args {
    taskId?: TaskId;
    villageId?: number;
    buildId?: number;
    categoryId?: number;
    tabId?: number;
    buildTypeId?: number;
    troopId?: number;
    trainCount?: number;
    resources?: ResourcesInterface;
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
