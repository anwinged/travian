import { Grabber } from './Grabber';
import { grabActiveVillageId } from '../Page/VillageBlock';
import { VillageState } from '../State/VillageState';
import { grabIncomingMerchants } from '../Page/BuildingPage';
import { isMarketSendResourcesPage } from '../Page/PageDetectors';

export class MarketPageGrabber extends Grabber {
    grab(): void {
        if (!isMarketSendResourcesPage()) {
            return;
        }

        const villageId = grabActiveVillageId();
        const state = new VillageState(villageId);
        state.storeIncomingMerchants(grabIncomingMerchants());
    }
}
