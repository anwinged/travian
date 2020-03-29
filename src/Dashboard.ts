import * as URLParse from 'url-parse';
import { markPage, sleepShort } from './utils';
import { v4 as uuid } from 'uuid';
import { QueueItem } from './Queue';
import Scheduler from './Scheduler';
import UpgradeBuildingTask from './Task/UpgradeBuildingTask';

export default class Dashboard {
    private scheduler: Scheduler;

    constructor(scheduler: Scheduler) {
        this.scheduler = scheduler;
    }

    async run() {
        const p = new URLParse(window.location.href, true);
        console.log('PARSED LOCATION', p);

        await sleepShort();

        markPage('Dashboard');

        if (p.pathname === '/build.php') {
            console.log('BUILD PAGE DETECTED');
            const id = uuid();
            jQuery('.upgradeButtonsContainer .section1').append(
                `<div style="padding: 8px"><a id="${id}" href="#">В очередь</a></div>`
            );
            jQuery(`#${id}`).on('click', () => {
                const queueItem = new QueueItem(UpgradeBuildingTask.NAME, {
                    id: p.query['id'],
                });
                this.scheduler.pushTask(queueItem);
                return false;
            });
        }
    }
}
