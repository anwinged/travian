import { VillageController } from '../VillageController';

export abstract class Grabber {
    protected controller: VillageController;

    constructor(controller: VillageController) {
        this.controller = controller;
    }

    abstract grab(): void;
}
