import { Grabber } from './Grabber';
import { grabBuildingSlots } from '../Page/SlotBlock';
import { parseLocation } from '../Helpers/Browser';

export class VillageBuildingsPageGrabber extends Grabber {
    grab(): void {
        const p = parseLocation();
        if (p.pathname !== '/dorf2.php') {
            return;
        }

        this.storage.storeBuildingSlots(grabBuildingSlots());
    }
}
