import { HeroAllResources, HeroResourceType, Resources, ResourceStorage } from '../Game';

export namespace Core {
    export function calcHeroResource(
        current: Resources,
        required: Resources,
        totalRequired: Resources,
        storage: ResourceStorage
    ): HeroResourceType {
        const resourceDiff = calcNeedResources(current, required, totalRequired, storage);
        const resourcesAsList = resourceDiff.asList();

        const sorted = resourcesAsList.filter(x => x.value > 0).sort((x, y) => y.value - x.value);

        if (sorted.length === 0) {
            return HeroAllResources;
        }

        const maxRequirement = sorted[0];
        const minRequirement = sorted[sorted.length - 1];
        const delta = maxRequirement.value - minRequirement.value;
        const eps = maxRequirement.value / 10;

        return delta > eps ? maxRequirement.type : HeroAllResources;
    }

    function calcNeedResources(
        current: Resources,
        required: Resources,
        totalRequired: Resources,
        storage: ResourceStorage
    ): Resources {
        if (!current.gt(required)) {
            return required.sub(current);
        }

        if (!current.gt(totalRequired)) {
            return totalRequired.sub(current);
        }

        return Resources.fromStorage(storage).sub(current);
    }
}
