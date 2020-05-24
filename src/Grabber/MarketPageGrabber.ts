import { Grabber } from './Grabber';
import { isMarketSendResourcesPage } from '../Page/PageDetectors';
import { grabIncomingMerchants } from '../Page/BuildingPage/MarketPage';

export class MarketPageGrabber extends Grabber {
    grab(): void {
        if (!isMarketSendResourcesPage()) {
            return;
        }

        this.storage.storeIncomingMerchants(grabIncomingMerchants());
    }
}
