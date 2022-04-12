"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class BotInventory {
    constructor(mineBot) {
        this.getStoneSlots = () => {
            return Object.values(this.bot.inventory.items()).filter((slot) => {
                if (slot == null || !slot.nbt) {
                    return false;
                }
                const nbt_label = slot.nbt.value.display.value.Name.value;
                if (!nbt_label.includes('Груз')) {
                    return false;
                }
                return true;
            });
        };
        this.getEmptyBottleSlots = () => {
            return Object.values(this.bot.inventory.items()).filter((slot) => {
                if (slot == null || !slot.name.includes('glass_bottle')) {
                    return false;
                }
                return true;
            });
        };
        this.equipItem = (name, destination) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const item = this.itemByName(name);
                if (!item) {
                    console.log(`У меня нет ${name}`);
                    return reject();
                }
                try {
                    yield this.bot.equip(item, destination);
                    return resolve();
                }
                catch (err) {
                    console.log(`Не могу взять ${name}: ${err.message}`);
                    return reject();
                }
            }));
        });
        this.printInventry = () => {
            const items = this.bot.inventory.items();
            const output = items.map(BotInventory.itemToString).join("\n");
            if (!output) {
                console.log("Пустой");
            }
            console.log(output);
            console.log();
        };
        this.itemsByName = (name) => {
            const items = this.bot.inventory.items();
            if (this.mcData.isNewerOrEqualTo('1.9') && this.bot.inventory.slots[45])
                items.push(this.bot.inventory.slots[45]);
            return items.filter(item => item.name === name);
        };
        this.itemByName = (name) => {
            return this.itemsByName(name)[0];
        };
        this.getInventoryItemsCount = () => {
            const items = this.bot.inventory.items();
            const itemsCount = {};
            items.forEach(item => {
                if (item.name in itemsCount) {
                    itemsCount[item.name] += item.count;
                    return;
                }
                itemsCount[item.name] = item.count;
            });
            return itemsCount;
        };
        this.mineBot = mineBot;
        this.bot = mineBot.bot;
        this.mcData = mineBot.mcData;
    }
}
exports.default = BotInventory;
BotInventory.itemToString = (item) => {
    if (item) {
        return `${item.name} x ${item.count}`;
    }
    return "(nothing)";
};
