import { VillageFactory } from './VillageFactory';
import { Resources, ResourcesInterface } from '../Core/Resources';
import { VillageController } from './VillageController';

export interface ResourceTransferScore {
    amount: number;
    overflow: boolean;
}

export interface ResourceTransferReport {
    fromVillageId: number;
    toVillageId: number;
    resources: ResourcesInterface;
    score: ResourceTransferScore;
}

export function compareReports(r1: ResourceTransferReport, r2: ResourceTransferReport): number {
    if (r1.score.overflow !== r2.score.overflow) {
        const o1 = r1.score.overflow ? 1 : 0;
        const o2 = r2.score.overflow ? 1 : 0;
        return o2 - o1;
    }
    return r2.score.amount - r1.score.amount;
}

export class ResourceTransferCalculator {
    private factory: VillageFactory;
    constructor(factory: VillageFactory) {
        this.factory = factory;
    }

    calc(fromVillageId: number, toVillageId: number): ResourceTransferReport {
        const sender = this.factory.getById(fromVillageId).controller();
        const recipient = this.factory.getById(toVillageId).controller();

        let [senderReadyResources, recipientNeedResources] = this.getTransferResourcePair(
            sender,
            recipient
        );

        const multiplier = sender.getSendResourcesMultiplier();
        senderReadyResources = senderReadyResources.downTo(multiplier);
        recipientNeedResources = recipientNeedResources.upTo(multiplier);

        const contractResources = senderReadyResources.min(recipientNeedResources);

        const merchantsInfo = sender.getMerchantsInfo();
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

        return {
            fromVillageId,
            toVillageId,
            resources: readyToTransfer,
            score: {
                amount: readyToTransfer.amount(),
                overflow: sender.getState().warehouse.isOverflowing,
            },
        };
    }

    private getTransferResourcePair(
        sender: VillageController,
        recipient: VillageController
    ): [Resources, Resources] {
        if (sender.getState().warehouse.isOverflowing) {
            return [sender.getOverflowResources(), recipient.getAvailableToReceiveResources()];
        }

        return [sender.getFreeResources(), recipient.getRequiredResources()];
    }
}
