import { Resources } from './Resources';
import { HeroAllResources, HeroResourceType } from './Hero';

export function calcHeroResource(requirements: ReadonlyArray<Resources>): HeroResourceType {
    const resourceDiff = getFirstRequirement(requirements);
    const resourcesAsList = resourceDiff.asList();

    const sorted = resourcesAsList.sort((x, y) => x.value - y.value);

    const maxRequirement = sorted[0];
    const minRequirement = sorted[sorted.length - 1];

    const delta = Math.abs(maxRequirement.value - minRequirement.value);
    const eps = Math.abs(maxRequirement.value / 10);

    return delta > eps ? maxRequirement.type : HeroAllResources;
}

function getFirstRequirement(requirements: ReadonlyArray<Resources>): Resources {
    for (let required of requirements) {
        if (required.lt(Resources.zero())) {
            return required;
        }
    }

    return Resources.zero();
}
