import { it, describe } from 'mocha';
import { expect } from 'chai';
import { getNumber } from '../src/utils';

describe('Utils', function() {
    it('Can parse positive number', function() {
        const text = '123';
        expect(getNumber(text)).to.be.equals(123);
    });

    it('Can parse positive number with noise', function() {
        const text = '  123 ';
        expect(getNumber(text)).to.be.equals(123);
    });

    it('Can parse negative number', function() {
        const text = '-‭146';
        expect(getNumber(text)).to.be.equals(-146);
    });

    it('Can parse negative number with minus sign', function() {
        const text = '\u2212132';
        expect(getNumber(text)).to.be.equals(-132);
    });
});
