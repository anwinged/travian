export enum ContractType {
    UpgradeBuilding,
    ImproveTrooper,
}

export interface ContractAttributes {
    type: ContractType;
    buildId?: number;
    unitId?: number;
}
