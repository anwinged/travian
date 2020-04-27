import { TaskId } from './Queue/TaskQueue';
import { ResourcesInterface } from './Core/Resources';
import { CoordinatesInterface } from './Core/Village';

export interface Args {
    taskId?: TaskId;
    targetTaskId?: TaskId;
    villageId?: number;
    buildId?: number;
    categoryId?: number;
    sheetId?: number;
    tabId?: number;
    buildTypeId?: number;
    troopId?: number;
    trainCount?: number;
    resources?: ResourcesInterface;
    coordinates?: CoordinatesInterface;
    level?: number;
    selector?: string;
    path?: string;
}

export class Command {
    readonly name: string;
    readonly args: Args;

    constructor(name: string, args: Args) {
        this.name = name;
        this.args = args;
    }
}
