import { Grabber } from './Grabber';
import { isMarketSendResourcesPage } from '../Page/PageDetectors';
import { grabIncomingMerchants } from '../Page/BuildingPage/MarketPage';

export class MarketPageGrabber extends Grabber {
    grab(): void {
        if (!isMarketSendResourcesPage()) {
            return;
        }

        const storage = this.controller.getStorage();
        storage.storeIncomingMerchants(grabIncomingMerchants());
    }
}
