import { Resources, ResourceType } from '../Game';
import { GrabError } from '../Errors';
import { getNumber } from '../utils';

export function grabResources(): Resources {
    const lumber = grabResource(ResourceType.Lumber);
    const clay = grabResource(ResourceType.Clay);
    const iron = grabResource(ResourceType.Iron);
    const crop = grabResource(ResourceType.Crop);

    const warehouse = grabCapacity('warehouse');
    const granary = grabCapacity('granary');

    return new Resources(lumber, clay, iron, crop, warehouse, granary);
}

function findStockBarElement() {
    const stockBarElement = jQuery('#stockBar');
    if (stockBarElement.length !== 1) {
        throw new GrabError('Stock Bar not found');
    }
    return stockBarElement;
}

function grabResource(type: number): number {
    const resElement = findStockBarElement().find(`#l${type}`);
    if (resElement.length !== 1) {
        throw new GrabError(`Resource #${type} not found`);
    }
    return getNumber(resElement.text().replace(/[^0-9]/g, ''));
}

function grabCapacity(type: string): number {
    const capacityElement = findStockBarElement().find(`.${type} .capacity .value`);
    if (capacityElement.length !== 1) {
        throw new GrabError(`Capacity #${type} not found`);
    }
    return getNumber(capacityElement.text().replace(/[^0-9]/g, ''));
}