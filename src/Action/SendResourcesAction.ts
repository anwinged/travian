import { ActionController, registerAction } from './ActionController';
import { AbortTaskError, ActionError, TryLaterError } from '../Errors';
import { Task } from '../Queue/TaskQueue';
import { Resources } from '../Core/Resources';
import { Coordinates, Village } from '../Core/Village';
import { clickSendButton, fillSendResourcesForm, grabMerchantsInfo } from '../Page/BuildingPage';
import { grabVillageResources } from '../Page/ResourcesBlock';
import { grabActiveVillageId, grabVillageList } from '../Page/VillageBlock';
import { SendResourcesTask } from '../Task/SendResourcesTask';
import { aroundMinutes, timestamp } from '../utils';
import { VillageState } from '../State/VillageState';
import { Args } from '../Queue/Args';

function err(msg): never {
    throw new ActionError(msg);
}

const TIMEOUT = 15;

@registerAction
export class SendResourcesAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const resources = Resources.fromObject(args.resources || err('No resources'));
        const coordinates = Coordinates.fromObject(args.coordinates || err('No coordinates'));

        console.log('Send', resources, 'to', coordinates);

        const recipientVillage = this.findRecipientVillage(coordinates);
        const readyToTransfer = this.getResourcesForTransfer(recipientVillage.id).min(resources);

        const remainingResources = resources.sub(readyToTransfer).max(Resources.zero());

        console.log('Total res', resources);
        console.log('To transfer res', readyToTransfer);
        console.log('Remaining res', remainingResources);

        if (!remainingResources.empty()) {
            console.log('Schedule next', remainingResources);
            this.scheduler.scheduleTask(
                SendResourcesTask.name,
                {
                    ...args,
                    resources: remainingResources,
                },
                timestamp() + aroundMinutes(TIMEOUT)
            );
        }

        fillSendResourcesForm(readyToTransfer, coordinates);
        clickSendButton();
    }

    private findRecipientVillage(coordinates: Coordinates): Village {
        const villageList = grabVillageList();
        const village = villageList.find(v => v.crd.eq(coordinates));
        if (!village) {
            throw new AbortTaskError('No village');
        }
        return village;
    }

    private getMerchantsCapacity(): number {
        const merchants = grabMerchantsInfo();
        const capacity = merchants.available * merchants.carry;
        if (!capacity) {
            throw new TryLaterError(aroundMinutes(TIMEOUT), 'No merchants');
        }
        return capacity;
    }

    private getSenderAvailableResources(): Resources {
        const villageId = grabActiveVillageId();
        const resources = grabVillageResources();
        const requirements = this.scheduler.getVillageRequiredResources(villageId);
        const free = resources.sub(requirements).max(Resources.zero());
        console.log('Sender res', resources);
        console.log('Sender req', requirements);
        console.log('Sender free', free);
        if (free.amount() < 100) {
            throw new TryLaterError(aroundMinutes(TIMEOUT), 'Little free resources');
        }
        return free;
    }

    private getRecipientRequirements(villageId: number): Resources {
        const state = new VillageState(villageId);
        const resources = state.getResources();
        const incoming = state.getIncomingMerchants().reduce((m, i) => m.add(i.resources), Resources.zero());
        const requirements = this.scheduler.getVillageRequiredResources(villageId);
        const missing = requirements
            .sub(incoming)
            .sub(resources)
            .max(Resources.zero());
        console.log('Recipient res', resources);
        console.log('Recipient incoming', incoming);
        console.log('Recipient req', requirements);
        console.log('Recipient missing', missing);
        if (missing.empty()) {
            throw new TryLaterError(aroundMinutes(TIMEOUT), 'No missing resources');
        }
        return missing;
    }

    private getResourcesForTransfer(recipientVillageId): Resources {
        const senderResources = this.getSenderAvailableResources();
        const recipientNeeds = this.getRecipientRequirements(recipientVillageId);
        const prepared = senderResources.min(recipientNeeds);
        const capacity = this.getMerchantsCapacity();

        let readyToTransfer = prepared;
        if (prepared.amount() > capacity) {
            readyToTransfer = prepared.scale(capacity / prepared.amount());
        }

        console.log('Sender', senderResources);
        console.log('Recipient', recipientNeeds);
        console.log('Prepared', prepared);
        console.log('Capacity', capacity);
        console.log('Ready to transfer', readyToTransfer);

        return readyToTransfer;
    }
}
