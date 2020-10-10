import { it, describe } from 'mocha';
import { expect } from 'chai';
import { path, uniqPaths } from '../../src/Helpers/Path';

describe('Path', function () {
    it('Can build path with empty query', function () {
        const p = path('/info.php');
        expect(p).to.be.equals('/info.php');
    });

    it('Can build path with query', function () {
        const p = path('/info.php', { foo: 'bar' });
        expect(p).to.be.equals('/info.php?foo=bar');
    });

    it('Can build path with complex query', function () {
        const p = path('/info.php', { a: 'x', b: 'y', c: 5 });
        expect(p).to.be.equals('/info.php?a=x&b=y&c=5');
    });

    it('Can build path with query (undefined part)', function () {
        const p = path('/info.php', { foo: 'bar', foobar: undefined });
        expect(p).to.be.equals('/info.php?foo=bar');
    });

    it('Can keep uniq paths', function () {
        const p1 = { name: '/info.php', query: { a: 'b' } };
        const p2 = { name: '/info.php', query: { a: 'b' } };
        const up = uniqPaths([p1, p2]);
        expect(up).to.has.lengthOf(1);
    });
});
