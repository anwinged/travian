import { Resources } from './Resources';
import { ResourceStorage } from './ResourceStorage';
import { HeroAllResources, HeroResourceType } from './Hero';

export function calcHeroResource(
    current: Resources,
    required: Resources,
    totalRequired: Resources,
    storage: ResourceStorage
): HeroResourceType {
    const resourceDiff = calcNeedResources(current, required, totalRequired, storage);
    const resourcesAsList = resourceDiff.asList();

    const sorted = resourcesAsList.sort((x, y) => y.value - x.value);

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
    if (current.lt(required)) {
        return required.sub(current);
    }

    if (current.lt(totalRequired)) {
        return totalRequired.sub(current);
    }

    return Resources.fromStorage(storage).sub(current);
}
