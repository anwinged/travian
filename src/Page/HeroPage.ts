import { GrabError } from '../Errors';
import { HeroAllResources, HeroAttributes, HeroResourceType } from '../Game';
import { getNumber } from '../utils';
import { ResourceMapping, ResourceType } from '../Core/ResourceType';

export function grabHeroAttributes(): HeroAttributes {
    const healthElement = jQuery('#attributes .attribute.health .powervalue .value');
    if (healthElement.length !== 1) {
        throw new GrabError('Health dom element not found');
    }

    return new HeroAttributes(getNumber(healthElement.text()));
}

export function grabCurrentHeroResource(): HeroResourceType {
    for (let mp of ResourceMapping) {
        if (checkHeroResourceType(mp.num)) {
            return mp.type;
        }
    }
    return HeroAllResources;
}

function checkHeroResourceType(typeAsNumber: number): boolean {
    const input = jQuery(`#resourceHero${typeAsNumber}`);
    if (input.length !== 1) {
        throw new GrabError(`Hero resource ${typeAsNumber} not found`);
    }
    return !!input.prop('checked');
}

export function changeHeroResource(type: HeroResourceType) {
    const typeAsNumber = heroResourceTypeToNumber(type);
    const input = jQuery(`#resourceHero${typeAsNumber}`);
    if (input.length !== 1) {
        throw new GrabError(`Hero resource ${typeAsNumber} not found`);
    }

    const btn = jQuery('#saveHeroAttributes');
    if (btn.length !== 1) {
        throw new GrabError(`Hero resource button not found`);
    }

    input.trigger('click');
    btn.trigger('click');
}

function heroResourceTypeToNumber(type: HeroResourceType): number {
    if (type === HeroAllResources) {
        return 0;
    }
    return type as ResourceType;
}

export function grabHeroVillage(): string | undefined {
    const status = jQuery('.heroStatusMessage').text();
    const hrefText = jQuery('.heroStatusMessage a').text();
    if (status.toLowerCase().includes('в родной деревне')) {
        return hrefText || undefined;
    } else {
        return undefined;
    }
}
