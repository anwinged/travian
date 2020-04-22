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
        expect(ResourceType.Iron).to.equals(heroRes);
    });

    it('Get resource if one is enough, others non equal', function() {
        const current = new Resources(100, 100, 100, 500);
        const required = new Resources(200, 200, 400, 300);
        const totalRequired = new Resources(200, 200, 400, 300);
        const storage = new ResourceStorage(1000, 1000);
        const heroRes = Core.calcHeroResource(current, required, totalRequired, storage);
        expect(ResourceType.Iron).to.equals(heroRes);
    });

    it('Get resource if one is enough, others three equal', function() {
        const current = new Resources(100, 100, 100, 500);
        const required = new Resources(400, 400, 400, 300);
        const totalRequired = new Resources(400, 400, 400, 300);
        const storage = new ResourceStorage(1000, 1000);
        const heroRes = Core.calcHeroResource(current, required, totalRequired, storage);
        expect(ResourceType.Lumber).to.equals(heroRes);
    });

    it('Get resource if all are enough, but storage non optimal', function() {
        const current = new Resources(500, 400, 300, 600);
        const required = new Resources(100, 100, 100, 100);
        const totalRequired = new Resources(100, 100, 100, 100);
        const storage = new ResourceStorage(1000, 1000);
        const heroRes = Core.calcHeroResource(current, required, totalRequired, storage);
        expect(ResourceType.Iron).to.equals(heroRes);
    });
});
