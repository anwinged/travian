import ModeDetector from './ModeDetector';
import Scheduler from './Scheduler';

const md = new ModeDetector();
if (md.isAuto()) {
    md.setAuto();
    console.log('AUTO MANAGEMENT ON');
    const scheduler = new Scheduler();
    scheduler.run();
} else {
    console.log('NORMAL MODE');
}
