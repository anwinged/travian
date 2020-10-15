import { ResourceType } from './ResourceType';

export class HeroAttributes {
    readonly health: number;

    constructor(health: number) {
        this.health = health;
    }

    static default() {
        return new HeroAttributes(0);
    }
}

export type HeroAllResourcesType = 'all';
export const HeroAllResources: HeroAllResourcesType = 'all';
export type HeroResourceType = ResourceType | HeroAllResourcesType;
