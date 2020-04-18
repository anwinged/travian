import { ConsoleLogger } from './Logger';
import { ModeDetector } from './ModeDetector';
import { Scheduler } from './Scheduler';
import { Executor } from './Executor';
import { ControlPanel } from './ControlPanel';
import TxtVersion from '!!raw-loader!./version.txt';

const logger = new ConsoleLogger('Travian');

logger.log('TRAVIAN AUTOMATION', TxtVersion);

const modeDetector = new ModeDetector();
const scheduler = new Scheduler();

if (modeDetector.isAuto()) {
    modeDetector.setAuto();
    logger.log('AUTO MANAGEMENT ON');
    const executor = new Executor(TxtVersion, scheduler);
    executor.run();
} else {
    logger.log('NORMAL MODE');
    const controlPanel = new ControlPanel(TxtVersion, scheduler);
    controlPanel.run();
}
