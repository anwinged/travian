import { it, describe } from 'mocha';
import { expect } from 'chai';

import { Task } from '../../src/Queue/TaskProvider';
import { TaskQueue } from '../../src/Queue/TaskQueue';
import { NullLogger } from '../../src/Logger';
import { ArrayTaskProvider } from '../../src/Queue/ArrayTaskProvider';

describe('Task Queue', function() {
    it('Can get task from queue', function() {
        const provider = new ArrayTaskProvider([new Task('1', 0, 'task', {})]);
        const queue = new TaskQueue(provider, new NullLogger());
        const task = queue.get(1);
        expect(task).instanceOf(Task);
    });

    it("Don't get unready task from queue", function() {
        const provider = new ArrayTaskProvider([new Task('1', 5, 'task', {})]);
        const queue = new TaskQueue(provider, new NullLogger());
        const task = queue.get(1);
        expect(task).is.equals(undefined);
    });
});
