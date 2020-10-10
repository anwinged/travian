import { it, describe } from 'mocha';
import { expect } from 'chai';

import { calcHeroResource } from '../../src/Core/HeroBalance';
import { Resources } from '../../src/Core/Resources';
import { ResourceType } from '../../src/Core/ResourceType';

describe('HeroBalance', function () {
    it('Get resource for single requirement', function () {
        const req = new Resources(0, 0, -100, 0);
        const heroRes = calcHeroResource([req]);
        expect(heroRes).to.equals(ResourceType.Iron);
    });

    it('Get resource for second requirement', function () {
        const req1 = new Resources(0, 0, 100, 0);
        const req2 = new Resources(0, -200, 20, 0);
        const heroRes = calcHeroResource([req1, req2]);
        expect(heroRes).to.equals(ResourceType.Clay);
    });
});
