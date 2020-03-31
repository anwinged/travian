import * as URLParse from 'url-parse';
import { markPage, sleep, uniqId } from './utils';
import Scheduler from './Scheduler';
import UpgradeBuildingTask from './Task/UpgradeBuildingTask';
import { Command } from './Common';
import TaskQueueRenderer from './TaskQueueRenderer';

export default class Dashboard {
    private readonly version: string;
    private scheduler: Scheduler;

    constructor(version: string, scheduler: Scheduler) {
        this.version = version;
        this.scheduler = scheduler;
    }

    async run() {
        await this.load();
        await sleep(1000);

        const p = new URLParse(window.location.href, true);
        console.log('PARSED LOCATION', p);

        markPage('Dashboard', this.version);
        new TaskQueueRenderer().render(this.scheduler.getTaskItems());

        if (p.pathname === '/dorf1.php') {
            this.showSlotIds('buildingSlot');
        }

        if (p.pathname === '/dorf2.php') {
            this.showSlotIds('aid');
        }

        if (p.pathname === '/build.php') {
            console.log('BUILD PAGE DETECTED');
            const id = uniqId();
            jQuery('.upgradeButtonsContainer .section1').append(
                `<div style="padding: 8px"><a id="${id}" href="#">В очередь</a></div>`
            );
            jQuery(`#${id}`).on('click', () => {
                const queueItem = new Command(UpgradeBuildingTask.NAME, {
                    id: p.query['id'],
                });
                this.scheduler.scheduleTask(queueItem);
                return false;
            });
        }
    }

    private showSlotIds(prefix: string) {
        jQuery('.level.colorLayer').each((idx, el) => {
            let num = '';
            el.classList.forEach(cls => {
                if (cls.startsWith(prefix)) {
                    num = cls.substr(prefix.length);
                }
            });
            const t = jQuery(el)
                .find('.labelLayer')
                .text();
            jQuery(el)
                .find('.labelLayer')
                .text(num + ':' + t);
        });
    }

    private async load() {
        return new Promise(resolve => jQuery(resolve));
    }
}
