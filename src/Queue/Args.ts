import { ResourcesInterface } from '../Core/Resources';
import { CoordinatesInterface } from '../Core/Village';
import { TaskId } from './TaskProvider';

export interface Args {
    taskId?: TaskId;
    targetTaskId?: TaskId;
    villageId?: number;
    targetVillageId?: number;
    buildId?: number;
    categoryId?: number;
    sheetId?: number;
    tabId?: number;
    buildTypeId?: number;
    troopId?: number;
    troopResources?: ResourcesInterface;
    trainCount?: number;
    resources?: ResourcesInterface;
    coordinates?: CoordinatesInterface;
    unitId?: number;
    level?: number;
    selector?: string;
    path?: string;
    celebrationIndex?: number;
}
