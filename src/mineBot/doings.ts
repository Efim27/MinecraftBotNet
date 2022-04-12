const vec3 = require("vec3");
const {
    goals: {
        GoalNear,
        Goal
    }
} = require("mineflayer-pathfinder");

import * as utils from "../utils";
import MineBot from './bot';
import BotInventory from './inventory';

import config from '../config/config.json';

export default class BotDoings {
    private mineBot: MineBot;

    private bot: any;
    private botInventory: BotInventory;

    constructor(mineBot: MineBot){
        this.mineBot = mineBot;

        this.bot = mineBot.bot;
        this.botInventory = mineBot.inventory;
    }

    public checkStats = async () => {
        await this.checkFood();
        await this.checkThirst();
        await this.checkHealth();
    }

    public checkFood = () => {
        if (this.mineBot.stats.food > config.bot.eatAfterMinFood) {
            return;
        }

        console.log(`Кушаю`);
        console.log(`Сытость: ${this.mineBot.stats.food}\n`);

        return this.eat();
    }

    public checkThirst = () => {
        if (this.mineBot.stats.thirst > config.bot.drinkAfterMinThirst) {
            return;
        }

        console.log(`Пью воду`);
        console.log(`Жажда: ${this.mineBot.stats.thirst}\n`);

        return this.drink();
    }

    public checkHealth = () => {
        const health: number = this.mineBot.stats.health;

        if (!health || health > 7) {
            return;
        }

        console.log(`Мало здоровья`);
        console.log(`Здоровье: ${health}\n`);

        return this.mineBot.destroy();

    }

    public eat = (): Promise<void> => {
        return new Promise(async (resolve) => {
            const foodItem = this.botInventory.itemByName('baked_potato');
    
            await this.gotoCoords(config.coords.eatingPlace);
            await this.bot.equip(foodItem, 'hand').catch(() => {});
            await this.bot.consume().catch(() => {});
            await this.bot.unequip('hand').catch(() => {});
    
            return resolve();
        });
    }
    
    public drink = (): Promise<void> => {
        return new Promise(async (resolve)=> {
            const foodItem = this.botInventory.itemByName('potion');

            await this.gotoCoords(config.coords.trashDrop);
            await this.bot.equip(foodItem, 'hand').catch(() => {});
            await this.bot.consume().catch(() => {});
            await this.bot.unequip('hand').catch(() => {});
    
            return resolve();
        });
    }

    public gotoCoords = (coords): Promise<void> => {
        return new Promise(async (resolve) => {
            await this.bot.pathfinder.goto(new GoalNear(coords[0], coords[1], coords[2], 1));
    
            return resolve();
        });
    }

    public blockClick = (x: number, y: number, z: number): Promise<void> => {
        return new Promise(async (resolve) => {
            const coordVec3 = vec3(x, y, z);
            const targetBlock = this.bot.blockAt(coordVec3);
            const clickCount = utils.randomIntFromInterval(2, 3);
            
            for (const iter in [...Array(clickCount).keys()]) {
                await this.bot.activateBlock(targetBlock);
            }
    
            return resolve();
        });
    }

    public findSign = (x, y, z) => {
        const coordsVec3 = vec3(x, y, z);
    
        return this.bot.findBlockSync({
            point: coordsVec3,
            matching: (block) => {
                return block.name.includes('sign');
            },
            maxDistance: 4,
            count: 1,
        });
    }

    public checkMoney = () => {
        this.bot.chat('/bal');
    }

    public printStats = () => {
        const botStats = this.mineBot.stats;

        console.log(`Здоровье: ${botStats.health}/20`);
        console.log(`Сытость: ${botStats.food}/20`);
        console.log(`Жажда: ${botStats.thirst}\n`);
    }

    public dropTrash = (): Promise<void> => {
        return new Promise(async (resolve) => {
            let trashSlots = [];
    
            trashSlots.push(...this.botInventory.getStoneSlots());
            trashSlots.push(...this.botInventory.getEmptyBottleSlots());
    
            await this.gotoCoords(config.coords.trashDrop);
            await utils.delay(50, 0);
    
            for (const trashSlot of trashSlots) {
                await this.bot.tossStack(trashSlot);
                await utils.delay(50, 10);
            }
    
            return resolve();
        });
    }

    public lookAway = async (awayDelta = 2) => {
        return this.bot.lookAt(this.bot.entity.position.offset(
            utils.randomIntFromInterval(-awayDelta, awayDelta),
            utils.randomIntFromInterval(-awayDelta, awayDelta),
            utils.randomIntFromInterval(-awayDelta, awayDelta)));
    }
}