export enum ProductionQueue {
    Building = 'building',
    TrainUnit = 'train_unit',
    UpgradeUnit = 'upgrade_unit',
    Celebration = 'celebration',
}

/**
 * Placed in order of execution priority. Order is important!
 */
export const ProductionQueueTypes: ReadonlyArray<ProductionQueue> = [
    ProductionQueue.TrainUnit,
    ProductionQueue.Celebration,
    ProductionQueue.UpgradeUnit,
    ProductionQueue.Building,
];

export function translateProductionQueue(queue: ProductionQueue): string {
    switch (queue) {
        case ProductionQueue.Building:
            return 'Строительство';
        case ProductionQueue.TrainUnit:
            return 'Обучение';
        case ProductionQueue.UpgradeUnit:
            return 'Улучшение';
        case ProductionQueue.Celebration:
            return 'Празднование';
    }
}
