import { it, describe } from 'mocha';
import { expect } from 'chai';

import { Resources, ResourceStorage, ResourceType } from '../../src/Game';
import { Core } from '../../src/Core/HeroBalance';

describe('HeroBalance', function() {
    it('Get resource for requirement', function() {
        const current = new Resources(100, 100, 100, 100);
        const required = new Resources(200, 200, 400, 300);
        const totalRequired = new Resources(200, 200, 400, 300);
        const storage = new ResourceStorage(1000, 1000);
        const heroRes = Core.calcHeroResource(current, required, totalRequired, storage);
        expect(heroRes).to.equals(ResourceType.Iron);
    });

    it('Get resource if one is enough', function() {
        const current = new Resources(100, 100, 100, 500);
        const required = new Resources(200, 200, 400, 300);
        const totalRequired = new Resources(200, 200, 400, 300);
        const storage = new ResourceStorage(1000, 1000);
        const heroRes = Core.calcHeroResource(current, required, totalRequired, storage);
        expect(heroRes).to.equals(ResourceType.Iron);
    });

    it('Get resource if all are enough, but storage non optimal', function() {
        const current = new Resources(600, 600, 500, 600);
        const required = new Resources(100, 100, 100, 100);
        const totalRequired = new Resources(100, 100, 100, 100);
        const storage = new ResourceStorage(1000, 1000);
        const heroRes = Core.calcHeroResource(current, required, totalRequired, storage);
        expect(heroRes).to.equals(ResourceType.Iron);
    });
});
