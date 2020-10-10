import { it, describe } from 'mocha';
import { expect } from 'chai';

import { TaskQueue } from '../../src/Queue/TaskQueue';
import { NullLogger } from '../../src/Logger';
import { ArrayTaskProvider } from '../../src/Queue/TaskProvider/ArrayTaskProvider';
import { Task } from '../../src/Queue/Task';

describe('Task Queue', function () {
    it('Can get task from queue', function () {
        const provider = new ArrayTaskProvider([new Task('1', 0, 'task', {})]);
        const queue = new TaskQueue(provider, new NullLogger());
        const task = queue.get(1);
        expect(task).to.be.instanceOf(Task);
    });

    it("Don't get unready task from queue", function () {
        const provider = new ArrayTaskProvider([new Task('1', 5, 'task', {})]);
        const queue = new TaskQueue(provider, new NullLogger());
        const task = queue.get(1);
        expect(task).to.be.undefined;
    });

    it('Can remove task by id', function () {
        const provider = new ArrayTaskProvider([
            new Task('id1', 1, 'task1', {}),
            new Task('id2', 2, 'task2', {}),
        ]);
        const queue = new TaskQueue(provider, new NullLogger());
        queue.remove((t) => t.id === 'id1');
        const tasks = provider.getTasks();
        expect(tasks).to.have.lengthOf(1);
        expect(tasks[0].ts).to.be.equals(2);
    });

    it('Can modify tasks', function () {
        const provider = new ArrayTaskProvider([
            new Task('1', 1, 'task1', {}),
            new Task('2', 3, 'task2', {}),
            new Task('3', 4, 'task3', {}),
        ]);
        const queue = new TaskQueue(provider, new NullLogger());
        queue.modify(
            (t) => t.ts < 4,
            (t) => new Task(t.id, 10, t.name, t.args)
        );
        const tasks = provider.getTasks();
        expect(4).is.equals(tasks[0].ts);
        expect(10).is.equals(tasks[1].ts);
        expect(10).is.equals(tasks[2].ts);
    });
});
