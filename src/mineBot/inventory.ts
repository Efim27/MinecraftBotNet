import MineBot from './bot';

export default class BotInventory {
    private mineBot: MineBot;

    private bot: any;
    private mcData: any;

    constructor(mineBot: MineBot){
        this.mineBot = mineBot;

        this.bot = mineBot.bot;
        this.mcData = mineBot.mcData;
    }

    public getStoneSlots = () => {
        return Object.values(this.bot.inventory.items()).filter((slot: any) => {
            if(slot == null || !slot.nbt) {
                return false;
            }
    
            const nbt_label = slot.nbt.value.display.value.Name.value;
            if (!nbt_label.includes('Груз')) {
                return false;
            }
    
            return true;
        });
    }

    public getEmptyBottleSlots = () => {
        return Object.values(this.bot.inventory.items()).filter((slot: any) => {
            if(slot == null || !slot.name.includes('glass_bottle')) {
                return false;
            }
    
            return true;
        });
    }

    public equipItem = async (name, destination): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            const item = this.itemByName(name)
            if (!item) {
                console.log(`У меня нет ${name}`);
                return reject();
            }
    
            try {
                await this.bot.equip(item, destination)
                return resolve();
            } catch (err) {
                console.log(`Не могу взять ${name}: ${err.message}`);
                return reject();
            }
        });
    }

    public printInventry = () => {
        const items = this.bot.inventory.items();
        const output = items.map(BotInventory.itemToString).join("\n");
    
        if (!output) {
            console.log("Пустой");
        }
    
        console.log(output);
        console.log();
    }

    public itemsByName = (name) => {
        const items = this.bot.inventory.items();
        if (this.mcData.isNewerOrEqualTo('1.9') && this.bot.inventory.slots[45]) items.push(this.bot.inventory.slots[45])
    
        return items.filter(item => item.name === name);
    }

    public itemByName = (name) => {
        return this.itemsByName(name)[0];
    }

    public getInventoryItemsCount = () => {
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

    static itemToString = (item): string => {
        if (item) {
            return `${item.name} x ${item.count}`;
        }

        return "(nothing)";
    }
}