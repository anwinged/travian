import { Grabber } from './Grabber';
import { isMarketSendResourcesPage } from '../Page/PageDetector';
import { grabIncomingMerchants, grabMerchantsInfo } from '../Page/BuildingPage/MarketPage';

export class MarketPageGrabber extends Grabber {
    grab(): void {
        if (!isMarketSendResourcesPage()) {
            return;
        }

        this.storage.storeIncomingMerchants(grabIncomingMerchants());
        this.storage.storeMerchantsInfo(grabMerchantsInfo());
    }
}
