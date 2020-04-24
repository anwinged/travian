import { ActionController, registerAction } from './ActionController';
import { Args } from '../Command';
import { AbortTaskError, ActionError } from '../Errors';
import { Task } from '../Queue/TaskQueue';
import { Resources } from '../Core/Resources';
import { Coordinates } from '../Core/Village';
import { clickSendButton, fillSendResourcesForm, grabMerchantsInfo } from '../Page/BuildingPage';
import { grabVillageResources } from '../Page/ResourcesBlock';
import { grabVillageList } from '../Page/VillageBlock';
import { SendResourcesTask } from '../Task/SendResourcesTask';
import { timestamp } from '../utils';
import { VillageState } from '../State/VillageState';

function err(msg): never {
    throw new ActionError(msg);
}

@registerAction
export class SendResourcesAction extends ActionController {
    async run(args: Args, task: Task): Promise<any> {
        const resources = Resources.fromObject(args.resources || err('No resources'));
        const coordinates = Coordinates.fromObject(args.coordinates || err('No coordinates'));

        const merchants = grabMerchantsInfo();
        const villageList = grabVillageList();

        const village = villageList.find(v => v.crd.eq(coordinates));

        if (!village) {
            throw new AbortTaskError('No village');
        }

        const capacity = merchants.available * merchants.carry;

        if (!capacity) {
            throw new AbortTaskError('No merchants');
        }

        console.log('Send', resources, 'to', coordinates);
        console.log('Merchants', merchants, capacity);

        const villageResources = grabVillageResources();

        const targetVillageState = new VillageState(village.id);
        const targetVillageResources = targetVillageState.getResources();
        const targetVillageRequirements = this.scheduler
            .getVillageRequiredResources(village.id)
            .sub(targetVillageResources)
            .max(Resources.zero());

        if (targetVillageRequirements.eq(Resources.zero())) {
            throw new AbortTaskError('No requirements');
        }

        let sendResources = targetVillageRequirements.min(villageResources).min(resources);

        const reqSum = sendResources.lumber + sendResources.clay + sendResources.iron + sendResources.crop;

        let coeff = reqSum > capacity ? capacity / reqSum : 1;

        const normSendResources = sendResources.scale(coeff);

        const remainingResources = resources.sub(normSendResources);

        console.log('planned res', resources);
        console.log('current village res', villageResources);
        console.log('target village req', targetVillageRequirements);
        console.log('send res', sendResources);
        console.log('coeff', coeff);
        console.log('norm send res', normSendResources);
        console.log('remaining res', remainingResources);

        if (remainingResources.gt(Resources.zero())) {
            console.log('schedule next', remainingResources);
            this.scheduler.scheduleTask(
                SendResourcesTask.name,
                {
                    ...args,
                    resources: remainingResources,
                },
                timestamp() + 10 * 60
            );
        }

        fillSendResourcesForm(normSendResources, coordinates);
        clickSendButton();
    }
}
