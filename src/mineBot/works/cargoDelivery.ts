import BotDoings from '../doings';
import { Work } from '../working';
import * as utils from "../../utils";

import config from '../../config/config.json';

export default class CargoDelivery implements Work {
    private botDoings: BotDoings;

    constructor(botDoings: BotDoings){
        this.botDoings = botDoings;
    }

    private gotoHalfPath = () => {
        const pathVariantNumber: number = utils.randomIntFromInterval(0, 2);
        const pathCoord = config.coords.halfPathCoords[pathVariantNumber];

        return this.botDoings.gotoCoords(pathCoord);
    }

    public work = (): Promise<number> => {
        return new Promise(async (resolve) => {
            const startTimeMs = performance.now();

            //Идти к промежуточной координате
            await this.gotoHalfPath();

            //Идти к месту сбора материалов
            await this.botDoings.gotoCoords(config.coords.takingBlock);
            await utils.delay(50);
    
            //Взять материалы
            const num: number[] = config.coords.block;
            // @ts-ignore
            await this.botDoings.blockClick(...num);
            await utils.delay(50);

            //Идти к промежуточной координате
            await this.gotoHalfPath();

            //Идти к месту сдачи материалов
            await this.botDoings.gotoCoords(config.coords.putingBlock);
            await utils.delay(50);
    
            //Сдать материалы
            // @ts-ignore
            await this.botDoings.blockClick(...config.coords.sign);
            await utils.delay(50);
    
            const finishTimeMs = performance.now() - startTimeMs;
            return resolve(finishTimeMs);
        });
    };
}