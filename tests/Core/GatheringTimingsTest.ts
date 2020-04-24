import { it, describe } from 'mocha';
import { expect } from 'chai';

import { Resources } from '../../src/Core/Resources';
import { ResourceType } from '../../src/Core/ResourceType';
import { ResourceStorage } from '../../src/Core/ResourceStorage';
import { calcGatheringTimings, GatheringTimings } from '../../src/Core/GatheringTimings';

describe('Gathering timings', function() {
    it('Can calc common from numbers', function() {
        const timings = new GatheringTimings(10, 20, 15, 5);
        expect(20).to.equals(timings.common);
    });

    it('Can calc common with never', function() {
        const timings = new GatheringTimings(10, 20, 'never', 5);
        expect('never').to.equals(timings.common);
        expect(true).to.equals(timings.never);
    });

    it('Can calc common with all never', function() {
        const timings = new GatheringTimings('never', 'never', 'never', 'never');
        expect('never').to.equals(timings.common);
        expect(true).to.equals(timings.never);
    });

    it('Can calc timings', function() {
        const resources = new Resources(10, 10, 10, 10);
        const desired = new Resources(60, 60, 60, 60);
        const speed = new Resources(5, 5, 5, 5);
        const timings = calcGatheringTimings(resources, desired, speed);
        expect(10).to.equals(timings.common);
    });

    it('Can calc timings with different speed', function() {
        const resources = new Resources(10, 10, 10, 10);
        const desired = new Resources(60, 60, 60, 60);
        const speed = new Resources(5, 10, 25, 5);
        const timings = calcGatheringTimings(resources, desired, speed);
        expect(10).to.equals(timings.lumber);
        expect(5).to.equals(timings.clay);
        expect(2).to.equals(timings.iron);
        expect(10).to.equals(timings.crop);
        expect(10).to.equals(timings.common);
    });

    it('Can calc timings with negative speed', function() {
        const resources = new Resources(10, 10, 10, 10);
        const desired = new Resources(60, 60, 60, 60);
        const speed = new Resources(5, 10, 25, -5);
        const timings = calcGatheringTimings(resources, desired, speed);
        expect(10).to.equals(timings.lumber);
        expect(5).to.equals(timings.clay);
        expect(2).to.equals(timings.iron);
        expect('never').to.equals(timings.crop);
        expect('never').to.equals(timings.common);
        expect(true).to.equals(timings.never);
    });
});
