import * as URLParse from 'url-parse';
import { elClassId, markPage, waitForLoad } from '../utils';
import { Scheduler } from '../Scheduler';
import { UpgradeBuildingTask } from '../Task/UpgradeBuildingTask';
import { TaskQueueRenderer } from '../TaskQueueRenderer';
import { BuildPage } from './BuildPage';

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
            new BuildPage(this.scheduler, Number(p.query.id)).run();
        }
    }

    private renderTaskQueue() {
        this.log('RENDER TASK QUEUE');
        new TaskQueueRenderer().render(this.scheduler.getTaskItems());
    }

    private showSlotIds(prefix: string) {
        const tasks = this.scheduler.getTaskItems();
        jQuery('.level.colorLayer').each((idx, el) => {
            const buildId = elClassId(jQuery(el).attr('class') || '', prefix);
            const oldLabel = jQuery(el)
                .find('.labelLayer')
                .text();
            jQuery(el)
                .find('.labelLayer')
                .text(buildId + ':' + oldLabel);
            const inQueue = tasks.find(
                t => t.cmd.name === UpgradeBuildingTask.name && Number(t.cmd.args.id) === Number(buildId)
            );
            if (inQueue !== undefined) {
                jQuery(el).css({
                    'background-image': 'linear-gradient(to top, #f00, #f00 100%)',
                });
            }
        });
    }

    private log(...args) {
        console.log('SCHEDULER:', ...args);
    }

    private logError(...args) {
        console.error(...args);
    }
}
