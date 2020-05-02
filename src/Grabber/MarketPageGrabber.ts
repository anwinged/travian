import { Grabber } from './Grabber';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { VillageStorage } from '../Storage/VillageStorage';
import { isMarketSendResourcesPage } from '../Page/PageDetectors';
import { grabIncomingMerchants } from '../Page/BuildingPage/MarketPage';

export class MarketPageGrabber extends Grabber {
    grab(): void {
        if (!isMarketSendResourcesPage()) {
            return;
        }

        const villageId = grabActiveVillageId();
        const state = new VillageStorage(villageId);
        state.storeIncomingMerchants(grabIncomingMerchants());
    }
}
