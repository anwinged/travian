import { ResourceType } from './ResourceType';

export class HeroAttributes {
    readonly health: number;

    constructor(health: number) {
        this.health = health;
    }
}

export type HeroAllResourcesType = 'all';
export const HeroAllResources: HeroAllResourcesType = 'all';
export type HeroResourceType = ResourceType | HeroAllResourcesType;
