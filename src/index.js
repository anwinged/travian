import { ModeDetector } from './ModeDetector';
import { Scheduler } from './Scheduler';
import { Dashboard } from './Dashboard/Dashboard';
import TxtVersion from '!!raw-loader!./version.txt';

console.log('TRAVIAN AUTOMATION', TxtVersion);

const md = new ModeDetector();
if (md.isAuto()) {
    md.setAuto();
    console.log('AUTO MANAGEMENT ON');
    const scheduler = new Scheduler(TxtVersion);
    scheduler.run();
} else {
    console.log('NORMAL MODE');
    const dashboard = new Dashboard(TxtVersion, new Scheduler());
    dashboard.run();
}
