import { Grabber } from './Grabber';
import { parseLocation } from '../utils';
import { grabBuildingSlots } from '../Page/SlotBlock';

export class VillageBuildingsPageGrabber extends Grabber {
    grab(): void {
        const p = parseLocation();
        if (p.pathname !== '/dorf2.php') {
            return;
        }

        this.storage.storeBuildingSlots(grabBuildingSlots());
    }
}
