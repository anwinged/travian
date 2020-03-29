import ModeDetector from './ModeDetector';
import Scheduler from './Scheduler';
import Dashboard from './Dashboard';

const md = new ModeDetector();
if (md.isAuto()) {
    md.setAuto();
    console.log('AUTO MANAGEMENT ON');
    const scheduler = new Scheduler();
    scheduler.run();
} else {
    console.log('NORMAL MODE');
    const dashboard = new Dashboard(new Scheduler());
    dashboard.run();
}
