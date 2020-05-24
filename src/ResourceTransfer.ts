import { VillageFactory } from './VillageFactory';
import { ResourcesInterface } from './Core/Resources';

export interface ResourceTransferReport {
    fromVillageId: number;
    toVillageId: number;
    resources: ResourcesInterface;
    score: number;
}

export class ResourceTransferCalculator {
    private factory: VillageFactory;
    constructor(factory: VillageFactory) {
        this.factory = factory;
    }

    calc(fromVillageId: number, toVillageId: number): ResourceTransferReport {
        const senderState = this.factory.createState(fromVillageId);
        const senderController = this.factory.createController(fromVillageId);
        const senderStorage = this.factory.createStorage(fromVillageId);

        const recipientController = this.factory.createController(toVillageId);

        const multiplier = senderState.settings.sendResourcesMultiplier;
        const senderReadyResources = senderController.getAvailableForSendResources().downTo(multiplier);
        const recipientNeedResources = recipientController.getRequiredResources().upTo(multiplier);
        const contractResources = senderReadyResources.min(recipientNeedResources);

        const merchantsInfo = senderStorage.getMerchantsInfo();
        const merchantsCapacity = merchantsInfo.available * merchantsInfo.carry;

        let readyToTransfer = contractResources;
        if (contractResources.amount() && contractResources.amount() > merchantsCapacity) {
            const merchantScale = merchantsCapacity / contractResources.amount();
            readyToTransfer = contractResources.scale(merchantScale).downTo(multiplier);
        }

        console.log('Merchants capacity', merchantsCapacity);

        console.table([
            { name: 'Sender', ...senderReadyResources },
            { name: 'Recipient', ...recipientNeedResources },
            { name: 'Prepared', ...contractResources },
            { name: 'Ready to transfer', ...readyToTransfer },
        ]);

        return { fromVillageId, toVillageId, resources: readyToTransfer, score: readyToTransfer.amount() };
    }
}
