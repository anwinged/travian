import { ConsoleLogger } from './Logger';
import { ModeDetector } from './ModeDetector';
import TxtVersion from '!!raw-loader!./version.txt';
import { Container } from './Container';

function main() {
    const logger = new ConsoleLogger('Travian');

    logger.info('TRAVIAN AUTOMATION', TxtVersion);

    const container = new Container(TxtVersion);
    const modeDetector = new ModeDetector();

    if (modeDetector.isAuto()) {
        modeDetector.setAuto();
        logger.info('AUTO MANAGEMENT ON');
        const executor = container.executor;
        executor.run();
    } else {
        logger.info('NORMAL MODE');
        const controlPanel = container.controlPanel;
        controlPanel.run();
    }
}

try {
    main();
} catch (e) {
    setTimeout(() => location.reload(), 5000);
}
