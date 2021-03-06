"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vec3 = require("vec3");
const { goals: { GoalNear, Goal } } = require("mineflayer-pathfinder");
const utils = __importStar(require("../utils"));
const config_json_1 = __importDefault(require("../config/config.json"));
class BotDoings {
    constructor(mineBot) {
        this.checkStats = () => __awaiter(this, void 0, void 0, function* () {
            this.checkFoodCount();
            yield this.checkSatiety();
            yield this.checkThirst();
            yield this.checkHealth();
        });
        this.checkSatiety = () => {
            if (this.mineBot.stats.food > config_json_1.default.bot.eatAfterMinFood) {
                return;
            }
            console.log(`??????????`);
            console.log(`??????????????: ${this.mineBot.stats.food}\n`);
            return this.eat();
        };
        this.checkFoodCount = () => {
            const botInventory = this.botInventory.getInventoryItemsCount();
            if (botInventory['potion'] < 3) {
                console.log('???????? ????????');
                return this.mineBot.destroy();
            }
            if (botInventory['baked_potato'] < 8) {
                console.log('???????? ??????');
                return this.mineBot.destroy();
            }
        };
        this.checkThirst = () => {
            if (this.mineBot.stats.thirst > config_json_1.default.bot.drinkAfterMinThirst) {
                return;
            }
            console.log(`?????? ????????`);
            console.log(`??????????: ${this.mineBot.stats.thirst}\n`);
            return this.drink();
        };
        this.checkHealth = () => {
            const health = this.mineBot.stats.health;
            if (!health || health > 7) {
                return;
            }
            console.log(`???????? ????????????????`);
            console.log(`????????????????: ${health}\n`);
            return this.mineBot.destroy();
        };
        this.eat = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const foodItem = this.botInventory.itemByName('baked_potato');
                yield this.gotoCoords(config_json_1.default.coords.eatingPlace);
                yield this.bot.equip(foodItem, 'hand').catch(() => { });
                yield this.bot.consume().catch(() => { });
                yield this.bot.unequip('hand').catch(() => { });
                return resolve();
            }));
        };
        this.drink = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const foodItem = this.botInventory.itemByName('potion');
                yield this.gotoCoords(config_json_1.default.coords.trashDrop);
                yield this.bot.equip(foodItem, 'hand').catch(() => { });
                yield this.bot.consume().catch(() => { });
                yield this.bot.unequip('hand').catch(() => { });
                return resolve();
            }));
        };
        this.gotoCoords = (coords) => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                yield this.bot.pathfinder.goto(new GoalNear(coords[0], coords[1], coords[2], 1));
                return resolve();
            }));
        };
        this.blockClick = (x, y, z) => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const coordVec3 = vec3(x, y, z);
                const targetBlock = this.bot.blockAt(coordVec3);
                const clickCount = utils.randomIntFromInterval(2, 3);
                for (const iter in [...Array(clickCount).keys()]) {
                    yield this.bot.activateBlock(targetBlock);
                }
                return resolve();
            }));
        };
        this.findSign = (x, y, z) => {
            const coordsVec3 = vec3(x, y, z);
            return this.bot.findBlockSync({
                point: coordsVec3,
                matching: (block) => {
                    return block.name.includes('sign');
                },
                maxDistance: 4,
                count: 1,
            });
        };
        this.checkMoney = () => {
            this.bot.chat('/bal');
        };
        this.printStats = () => {
            const botStats = this.mineBot.stats;
            console.log(`????????????????: ${botStats.health}/20`);
            console.log(`??????????????: ${botStats.food}/20`);
            console.log(`??????????: ${botStats.thirst}\n`);
        };
        this.dropTrash = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                let trashSlots = [];
                trashSlots.push(...this.botInventory.getStoneSlots());
                trashSlots.push(...this.botInventory.getEmptyBottleSlots());
                yield this.gotoCoords(config_json_1.default.coords.trashDrop);
                yield utils.delay(50, 0);
                for (const trashSlot of trashSlots) {
                    yield this.bot.tossStack(trashSlot);
                    yield utils.delay(50, 10);
                }
                return resolve();
            }));
        };
        this.lookAway = (awayDelta = 2) => __awaiter(this, void 0, void 0, function* () {
            return this.bot.lookAt(this.bot.entity.position.offset(utils.randomIntFromInterval(-awayDelta, awayDelta), utils.randomIntFromInterval(-awayDelta, awayDelta), utils.randomIntFromInterval(-awayDelta, awayDelta)));
        });
        this.mineBot = mineBot;
        this.bot = mineBot.bot;
        this.botInventory = mineBot.inventory;
    }
}
exports.default = BotDoings;
