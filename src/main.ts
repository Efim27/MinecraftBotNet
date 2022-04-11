import MineBot from "./mineBot/bot";
import * as utils from "./utils";

const main = async () => {
    const stringBotUsername = utils.getCurrentBotUsername();
    const bot: MineBot = new MineBot(stringBotUsername);

    await bot.login();
    await bot.work();
};

export default main;