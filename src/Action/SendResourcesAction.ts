import { ActionController, taskError, registerAction } from './ActionController';
import { TryLaterError } from '../Errors';
import { Resources } from '../Core/Resources';
import { Coordinates } from '../Core/Village';
import { aroundMinutes, timestamp } from '../utils';
import { Args } from '../Queue/Args';
import { Task } from '../Queue/TaskProvider';
import { clickSendButton, fillSendResourcesForm, grabMerchantsInfo } from '../Page/BuildingPage/MarketPage';
import { VillageState } from '../VillageState';

const TIMEOUT = 15;
const AMOUNT_THRESHOLD = 100;

@registerAction
export class SendResourcesAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        this.ensureSameVillage(args, task);

        const senderVillageId = args.villageId || taskError('No source village id');
        const targetVillageId = args.targetVillageId || taskError('No target village id');

        const coordinates = Coordinates.fromObject(args.coordinates || taskError('No coordinates'));

        const senderVillage = this.villageStateRepository.getVillageState(senderVillageId);
        const recipientVillage = this.villageStateRepository.getVillageState(targetVillageId);

        const readyToTransfer = this.getResourcesForTransfer(senderVillage, recipientVillage);

        console.log('To transfer res', readyToTransfer);

        // Schedule recurrent task
        this.scheduler.scheduleTask(task.name, task.args, timestamp() + aroundMinutes(TIMEOUT));

        fillSendResourcesForm(readyToTransfer, coordinates);
        clickSendButton();
    }

    private getMerchantsCapacity(): number {
        const merchants = grabMerchantsInfo();
        const capacity = merchants.available * merchants.carry;
        if (!capacity) {
            throw new TryLaterError(aroundMinutes(TIMEOUT), 'No merchants');
        }
        return capacity;
    }

    private getSenderAvailableResources(senderState: VillageState): Resources {
        const balance = senderState.required.balance;
        const free = balance.max(Resources.zero());

        console.table([
            { name: 'Sender balance', ...balance },
            { name: 'Sender free', ...free },
        ]);

        if (free.amount() < AMOUNT_THRESHOLD) {
            throw new TryLaterError(aroundMinutes(TIMEOUT), 'Little free resources');
        }
        return free;
    }

    private getRecipientRequirements(recipientState: VillageState): Resources {
        const maxPossibleToStore = recipientState.storage.capacity.sub(recipientState.performance);
        const currentResources = recipientState.resources;
        const incomingResources = recipientState.incomingResources;
        const requirementResources = recipientState.required.resources;
        const missingResources = requirementResources
            .min(maxPossibleToStore)
            .sub(incomingResources)
            .sub(currentResources)
            .max(Resources.zero());

        console.table([
            { name: 'Recipient max possible', ...maxPossibleToStore },
            { name: 'Recipient resources', ...currentResources },
            { name: 'Recipient incoming', ...incomingResources },
            { name: 'Recipient requirements', ...requirementResources },
            { name: 'Recipient missing', ...missingResources },
        ]);

        if (missingResources.empty()) {
            throw new TryLaterError(aroundMinutes(TIMEOUT), 'No missing resources');
        }

        return missingResources;
    }

    private getResourcesForTransfer(senderState: VillageState, recipientState: VillageState): Resources {
        const senderReadySendResources = this.getSenderAvailableResources(senderState);
        const recipientNeedsResources = this.getRecipientRequirements(recipientState);
        const contractResources = senderReadySendResources.min(recipientNeedsResources);
        const merchantsCapacity = this.getMerchantsCapacity();

        let readyToTransfer = contractResources;
        if (contractResources.amount() > merchantsCapacity) {
            const merchantScale = merchantsCapacity / contractResources.amount();
            readyToTransfer = contractResources.scale(merchantScale);
        }

        console.log('Merchants capacity', merchantsCapacity);

        console.table([
            { name: 'Sender', ...senderReadySendResources },
            { name: 'Recipient', ...recipientNeedsResources },
            { name: 'Prepared', ...contractResources },
            { name: 'Ready to transfer', ...readyToTransfer },
        ]);

        return readyToTransfer;
    }
}
