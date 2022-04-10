import MineBot from "./mineBot/bot";
import * as utils from "./utils";

const main = async () => {
    const stringBotUsername = utils.getCurrentBotUsername();
    const bot: MineBot = new MineBot(stringBotUsername);

    while (true) {
        try {
            await bot.login();
        } catch(e) {
            console.log('Факап логина');
            console.log(e);
        }
        
        try {
            await bot.work();
        } catch(e) {
            console.log('Факап...');
            console.log(e);
        }

        const relogAfterMs: number = utils.randomIntFromInterval(30000, 120000);
        console.log(`Перезагрузка через ${relogAfterMs} ms`);
        await utils.delay(relogAfterMs);
    }
};

main();