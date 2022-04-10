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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotWork = void 0;
const config_json_1 = __importDefault(require("../config/config.json"));
class BotWork {
    constructor(mineBot, workHandler) {
        this.loopNum = 1;
        this.loopTimeMs = 0;
        this.working = () => __awaiter(this, void 0, void 0, function* () {
            yield this.botDoings.dropBotTrash();
            yield this.botDoings.gotoCoords(config_json_1.default.coords.takingBlock);
            this.botDoings.checkBotMoney();
            while (true) {
                this.loopTimeMs = yield this.workHandler.work(this.botDoings);
                if (this.loopNum % config_json_1.default.bot.printStatsEveryLoopNum == 0) {
                    console.log();
                    console.log(`LoopNum: ${this.loopNum}`);
                    this.botDoings.checkBotMoney();
                    console.log(this.mineBot.getSalaryPerHour(this.loopTimeMs));
                    console.log();
                }
                this.loopNum++;
                yield this.botDoings.checkBotFood();
                yield this.botDoings.checkBotThirst();
            }
        });
        this.mineBot = mineBot;
        this.botDoings = mineBot.doings;
        this.workHandler = workHandler;
    }
}
exports.BotWork = BotWork;
