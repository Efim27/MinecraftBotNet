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
const mineflayer = require("mineflayer");
const proxyAgent = require('proxy-agent');
const socks = require('socks').SocksClient;
const { pathfinder, Movements } = require("mineflayer-pathfinder");
const blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer);
const main_1 = __importDefault(require("../main"));
const utils = __importStar(require("../utils"));
const inventory_1 = __importDefault(require("./inventory"));
const doings_1 = __importDefault(require("./doings"));
const working_1 = require("./working");
const cargoDelivery_1 = __importDefault(require("./works/cargoDelivery"));
const accounts_json_1 = __importDefault(require("../config/accounts.json"));
const config_json_1 = __importDefault(require("../config/config.json"));
class MineBot {
    constructor(username) {
        this.payMoneyOwner = false;
        this.mcData = require("minecraft-data")(config_json_1.default.server.version);
        this.bot = null;
        this.stats = {
            food: 0,
            health: 0,
            thirst: 0,
            money: 0
        };
        this.getPassword = () => {
            if (!(accounts_json_1.default.hasOwnProperty(this.username))) {
                throw new Error('Заданный username не найден в accounts.json');
            }
            return accounts_json_1.default[this.username];
        };
        this.getSalaryPerHour = (workingLoopTimeMs) => {
            return (3600 / (workingLoopTimeMs / 1000)) * 20;
        };
        this.connectToServer = () => {
            const connectProperties = {
                host: config_json_1.default.server.host,
                port: config_json_1.default.server.port,
                username: this.username,
                version: config_json_1.default.server.version
            };
            this.bot = mineflayer.createBot(connectProperties);
            //plugins
            this.bot.loadPlugin(pathfinder);
            this.bot.loadPlugin(blockFinderPlugin);
            //pathfinder
            const workingMove = new Movements(this.bot, this.mcData);
            workingMove.allow1by1towers = false;
            workingMove.allowSprinting = true;
            this.bot.pathfinder.setMovements(workingMove);
            this.bot.pathfinder.thinkTimeout = 500;
            this.bot.pathfinder.tickTimeout = 20;
            this.inventory = new inventory_1.default(this);
            this.doings = new doings_1.default(this);
            this.initEventHandlers();
        };
        this.destroy = () => {
            this.bot.quit();
            this.bot.end();
        };
        this.reLogin = () => __awaiter(this, void 0, void 0, function* () {
            const relogAfterMs = utils.randomIntFromInterval(30000, 120000);
            console.log(`Перезагрузка через ${relogAfterMs} ms`);
            yield utils.delay(relogAfterMs);
            (0, main_1.default)();
        });
        this.login = () => {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.connectToServer();
                this.bot.on("spawn", () => __awaiter(this, void 0, void 0, function* () {
                    this.bot.chat(`/l ${this.password}`);
                    yield utils.delay(utils.randomIntFromInterval(10000, 20000));
                    return resolve();
                }));
            }));
        };
        this.work = () => {
            return new Promise((reject) => __awaiter(this, void 0, void 0, function* () {
                const workHandler = new cargoDelivery_1.default(this.doings);
                const currentWork = new working_1.BotWork(this, workHandler);
                yield currentWork.working();
                return reject();
            }));
        };
        this.initEventHandlers = () => {
            this.bot.on("kicked", (reason) => __awaiter(this, void 0, void 0, function* () {
                console.log(`Кик: \n${reason}\n`);
                yield utils.delay(utils.randomIntFromInterval(15000, 30000));
                this.reLogin();
            }));
            this.bot.on("forcedMover", (reason) => __awaiter(this, void 0, void 0, function* () {
                this.bot.chat('Зигвимба');
                console.log(`Бот был принудительно перемещен на координаты: \n${this.bot.entity.position}\n`);
                yield utils.delay(1500);
                this.bot.quit();
                this.bot.end();
            }));
            this.bot.on("error", (reason) => __awaiter(this, void 0, void 0, function* () {
                console.log(`Ошибка: \n${reason}\n`);
                this.reLogin();
            }));
            this.bot.on("chat", (username, message) => __awaiter(this, void 0, void 0, function* () {
                if (username === this.bot.username)
                    return;
                if (message.includes('таскай'))
                    return;
                if (message.includes('зигвимба') && message.includes('Сеспель')) {
                    this.payMoneyOwner = true;
                }
                console.log(`(чат) ${message}`);
            }));
            this.bot.on("message", (jsonMsg, position) => __awaiter(this, void 0, void 0, function* () {
                //Фильтр вывода баланса
                if (!jsonMsg.extra) {
                    return;
                }
                const msgType = jsonMsg.extra[0].text;
                if (msgType != 'Баланс:') {
                    return;
                }
                const msgText = jsonMsg.extra[1].text.trim();
                const balanceNum = Number.parseInt(msgText.replace('$', '').replace(',', ''));
                console.log(`(${this.username}) Баланс: ${balanceNum} $`);
                if (this.payMoneyOwner) {
                    const payDelay = utils.randomIntFromInterval(30000, 120000);
                    console.log(`Выплата ${config_json_1.default.owner.username} пройдет через ${payDelay}`);
                    setTimeout(() => {
                        this.bot.chat(`/pay ${config_json_1.default.owner.username} ${balanceNum}`);
                        console.log(`Выплата ${config_json_1.default.owner.username} в размере ${balanceNum}$ прошла успешно`);
                        this.payMoneyOwner = false;
                    }, payDelay);
                }
            }));
            this.bot.on("bossBarUpdated", (bossBar) => __awaiter(this, void 0, void 0, function* () {
                this.stats.thirst = bossBar.health;
            }));
            this.bot.on("health", () => __awaiter(this, void 0, void 0, function* () {
                if (this.stats.food == this.bot.food) {
                    return;
                }
                this.stats.food = this.bot.food;
            }));
        };
        this.username = username;
        this.password = this.getPassword();
    }
}
exports.default = MineBot;
