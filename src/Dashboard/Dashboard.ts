import * as URLParse from 'url-parse';
import { markPage, waitForLoad } from '../utils';
import { Scheduler } from '../Scheduler';
import { TaskQueueRenderer } from '../TaskQueueRenderer';
import { BuildPage } from '../Page/BuildPage';

import { UpgradeBuildingTask } from '../Task/UpgradeBuildingTask';
import { grabResources } from '../Page/ResourcesBlock';
import { grabActiveVillageId, grabVillageList } from '../Page/VillageBlock';
import { onResourceSlotCtrlClick, showBuildingSlotIds, showResourceSlotIds } from '../Page/SlotBlock';

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

        const res = grabResources();
        this.log('RES', res);

        const villages = grabVillageList();
        this.log('VILL', villages);

        const villageId = grabActiveVillageId();

        const tasks = this.scheduler.getTaskItems();
        const buildingsInQueue = tasks
            .filter(t => t.name === UpgradeBuildingTask.name && t.args.villageId === villageId)
            .map(t => t.args.buildId);

        if (p.pathname === '/dorf1.php') {
            showResourceSlotIds(buildingsInQueue);
            onResourceSlotCtrlClick(buildId => {
                this.scheduler.scheduleTask(UpgradeBuildingTask.name, { villageId, buildId });
                const n = new Notification(`Building ${buildId} scheduled`);
                setTimeout(() => n && n.close(), 4000);
            });
        }

        if (p.pathname === '/dorf2.php') {
            showBuildingSlotIds(buildingsInQueue);
        }

        if (p.pathname === '/build.php') {
            new BuildPage(this.scheduler, Number(p.query.id)).run();
        }
    }

    private renderTaskQueue() {
        this.log('RENDER TASK QUEUE');
        new TaskQueueRenderer().render(this.scheduler.getTaskItems());
    }

    private log(...args) {
        console.log('SCHEDULER:', ...args);
    }

    private logError(...args) {
        console.error(...args);
    }
}
