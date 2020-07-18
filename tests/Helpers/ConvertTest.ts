import { it, describe } from 'mocha';
import { expect } from 'chai';
import { elClassId, getNumber } from '../../src/Helpers/Convert';

describe('Utils', function() {
    describe('getNumber', function() {
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

    describe('elClassId', function() {
        it('Can parse number with prefix', function() {
            const text = 'foo bar12 baz';
            expect(elClassId(text, 'bar')).to.be.equals(12);
        });

        it('Can parse number from parts with same prefix', function() {
            const text = 'foo12 foobar';
            expect(elClassId(text, 'foo')).to.be.equals(12);
        });
    });
});
