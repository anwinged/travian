import { it, describe } from 'mocha';
import { expect } from 'chai';

import { Resources } from '../../src/Core/Resources';

describe('Resources', function() {
    it('Can compare with lt', function() {
        const x = new Resources(0, 0, 0, 0);
        const y = new Resources(5, 5, 5, 5);
        expect(x.anyLower(y)).is.true;
    });

    it('Can compare with lt (mixed)', function() {
        const x = new Resources(20, 20, 5, 20);
        const y = new Resources(10, 10, 10, 10);
        expect(x.anyLower(y)).is.true;
    });

    it('Can compare with gt', function() {
        const x = new Resources(5, 5, 5, 5);
        const y = new Resources(0, 0, 0, 0);
        expect(x.allGreater(y)).is.true;
    });

    it('Can compare with gt (mixed)', function() {
        const x = new Resources(30, 30, 10, 30);
        const y = new Resources(20, 20, 20, 20);
        expect(x.allGreater(y)).is.false;
    });

    it('Can up to 1', function() {
        const resources = new Resources(0, 4, 10, 18);
        const upped = resources.upTo(1);
        expect(upped.eq(resources)).is.true;
    });

    it('Can up to 10', function() {
        const resources = new Resources(0, 4, 10, 18);
        const expected = new Resources(0, 10, 10, 20);
        const upped = resources.upTo(10);
        expect(upped.eq(expected)).is.true;
    });

    it('Can down to 10', function() {
        const resources = new Resources(0, 4, 10, 18);
        const expected = new Resources(0, 0, 10, 10);
        const lowed = resources.downTo(10);
        expect(lowed.eq(expected)).is.true;
    });
});
