import * as URLParse from 'url-parse';
import { markPage, uniqId, waitForLoad } from './utils';
import { Scheduler } from './Scheduler';
import { UpgradeBuildingTask } from './Task/UpgradeBuildingTask';
import { Command } from './Common';
import { TaskQueueRenderer } from './TaskQueueRenderer';

export class Dashboard {
    private readonly version: string;
    private scheduler: Scheduler;

    constructor(version: string, scheduler: Scheduler) {
        this.version = version;
        this.scheduler = scheduler;
    }

    async run() {
        await waitForLoad();

        const p = new URLParse(window.location.href, true);
        this.log('PARSED LOCATION', p);

        markPage('Dashboard', this.version);
        this.renderTaskQueue();
        setInterval(() => this.renderTaskQueue(), 5000);

        if (p.pathname === '/dorf1.php') {
            this.showSlotIds('buildingSlot');
        }

        if (p.pathname === '/dorf2.php') {
            this.showSlotIds('aid');
        }

        if (p.pathname === '/build.php') {
            this.log('BUILD PAGE DETECTED');
            const id = uniqId();
            jQuery('.upgradeButtonsContainer .section1').append(
                `<div style="padding: 8px"><a id="${id}" href="#">В очередь</a></div>`
            );
            jQuery(`#${id}`).on('click', evt => {
                evt.preventDefault();
                this.onScheduleBuilding(p.query.id || '');
            });
        }
    }

    private renderTaskQueue() {
        this.log('RENDER TASK QUEUE');
        new TaskQueueRenderer().render(this.scheduler.getTaskItems());
    }

    private onScheduleBuilding(id: string) {
        const queueItem = new Command(UpgradeBuildingTask.name, {
            id,
        });
        this.scheduler.scheduleTask(queueItem);
        const n = new Notification(`Building ${id} scheduled`);
        setTimeout(() => n && n.close(), 4000);
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

    private log(...args) {
        console.log('SCHEDULER:', ...args);
    }

    private logError(...args) {
        console.error(...args);
    }
}
