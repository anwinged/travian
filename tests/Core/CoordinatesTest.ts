import { it, describe } from 'mocha';
import { expect } from 'chai';

import { Coordinates } from '../../src/Core/Village';

describe('Coordinates', function () {
    it('Can compare same', function () {
        const a = new Coordinates(1, 1);
        const b = new Coordinates(1, 1);
        expect(a.eq(b)).is.true;
    });

    it('Can compare different', function () {
        const a = new Coordinates(1, 1);
        const b = new Coordinates(2, 1);
        expect(a.eq(b)).is.false;
    });

    it('Can calc distance', function () {
        const a = new Coordinates(0, 0);
        const b = new Coordinates(-3, -4);
        expect(a.dist(b)).is.equals(5);
    });
});
