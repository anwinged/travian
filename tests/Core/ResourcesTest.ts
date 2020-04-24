import { it, describe } from 'mocha';
import { expect } from 'chai';

import { Resources } from '../../src/Core/Resources';

describe('Resources', function() {
    it('Can compare with lt', function() {
        const x = new Resources(0, 0, 0, 0);
        const y = new Resources(5, 5, 5, 5);
        expect(true).is.equals(x.lt(y));
    });

    it('Can compare with lt (mixed)', function() {
        const x = new Resources(20, 20, 5, 20);
        const y = new Resources(10, 10, 10, 10);
        expect(true).is.equals(x.lt(y));
    });

    it('Can compare with gt', function() {
        const x = new Resources(5, 5, 5, 5);
        const y = new Resources(0, 0, 0, 0);
        expect(true).is.equals(x.gt(y));
    });

    it('Can compare with gt (mixed)', function() {
        const x = new Resources(30, 30, 10, 30);
        const y = new Resources(20, 20, 20, 20);
        expect(false).is.equals(x.gt(y));
    });
});
