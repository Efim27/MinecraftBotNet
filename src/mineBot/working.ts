import MineBot from './bot';
import BotDoings from './doings';
import * as utils from "../utils";

import config from '../config/config.json';

export interface Work {
    work(botDoings: BotDoings): Promise<number>
}

export class BotWork {
    private mineBot: MineBot;
    private botDoings: BotDoings;
    private workHandler: Work;

    private loopNum = 1;
    private loopTimeMs = 0;

    constructor(mineBot: MineBot, workHandler: Work){
        this.mineBot = mineBot;
        this.botDoings = mineBot.doings;

        this.workHandler = workHandler;
    }

    public working = async () => {
        await this.botDoings.dropBotTrash();
        await this.botDoings.gotoCoords(config.coords.takingBlock);
        this.botDoings.checkBotMoney();
    
        while (true) {
            this.loopTimeMs = await this.workHandler.work(this.botDoings);
    
            if (this.loopNum % config.bot.printStatsEveryLoopNum == 0) {
                console.log();
                console.log(`LoopNum: ${this.loopNum}`);
                this.botDoings.checkBotMoney();
                console.log(this.mineBot.getSalaryPerHour(this.loopTimeMs));
                console.log();
            }
    
            this.loopNum++;
    
            await this.botDoings.checkBotFood();
            await this.botDoings.checkBotThirst();
        }
    }
}