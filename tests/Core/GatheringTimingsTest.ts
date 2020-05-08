import { it, describe } from 'mocha';
import { expect } from 'chai';

import { Resources } from '../../src/Core/Resources';
import { calcGatheringTimings, GatheringTimings } from '../../src/Core/GatheringTimings';

describe('Gathering timings', function() {
    it('Can calc common from numbers', function() {
        const timings = GatheringTimings.create(10, 20, 15, 5);
        expect(20).to.equals(timings.slowest.seconds);
    });

    it('Can calc common with never', function() {
        const timings = GatheringTimings.create(10, 20, 'never', 5);
        expect(true).to.equals(timings.slowest.never);
    });

    it('Can calc common with all never', function() {
        const timings = GatheringTimings.create('never', 'never', 'never', 'never');
        expect(true).to.equals(timings.slowest.never);
    });

    it('Can calc timings', function() {
        const resources = new Resources(10, 10, 10, 10);
        const desired = new Resources(60, 60, 60, 60);
        const speed = new Resources(5, 5, 5, 5);
        const timings = calcGatheringTimings(resources, desired, speed);
        expect(10 * 3600).to.equals(timings.slowest.seconds);
    });

    it('Can calc timings with different speed', function() {
        const resources = new Resources(10, 10, 10, 10);
        const desired = new Resources(60, 60, 60, 60);
        const speed = new Resources(5, 10, 25, 5);
        const timings = calcGatheringTimings(resources, desired, speed);
        expect(10 * 3600).to.equals(timings.lumber.seconds);
        expect(5 * 3600).to.equals(timings.clay.seconds);
        expect(2 * 3600).to.equals(timings.iron.seconds);
        expect(10 * 3600).to.equals(timings.crop.seconds);
        expect(10 * 3600).to.equals(timings.slowest.seconds);
    });

    it('Can calc timings with negative speed', function() {
        const resources = new Resources(10, 10, 10, 10);
        const desired = new Resources(60, 60, 60, 60);
        const speed = new Resources(5, 10, 25, -5);
        const timings = calcGatheringTimings(resources, desired, speed);
        expect(10 * 3600).to.equals(timings.lumber.seconds);
        expect(5 * 3600).to.equals(timings.clay.seconds);
        expect(2 * 3600).to.equals(timings.iron.seconds);
        expect(true).to.equals(timings.crop.never);
        expect(true).to.equals(timings.slowest.never);
    });
});
