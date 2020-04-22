export enum ResourceType {
    Lumber = 1,
    Clay = 2,
    Iron = 3,
    Crop = 4,
}

export const ResourceMapping: ReadonlyArray<{ num: number; type: ResourceType }> = [
    { num: 1, type: ResourceType.Lumber },
    { num: 2, type: ResourceType.Clay },
    { num: 3, type: ResourceType.Iron },
    { num: 4, type: ResourceType.Crop },
];

export function numberToResourceType(typeAsNumber: number): ResourceType {
    for (let mp of ResourceMapping) {
        if (typeAsNumber === mp.num) {
            return mp.type;
        }
    }
    throw new Error(`Type ${typeAsNumber} in not valid`);
}

export type ResourceList = Array<{ num: number; type: ResourceType; value: number }>;
