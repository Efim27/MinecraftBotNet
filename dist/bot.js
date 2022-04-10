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
const vec3 = require("vec3");
const proxyAgent = require('proxy-agent');
const socks = require('socks').SocksClient;
const { pathfinder, Movements, goals: { GoalNear, Goal }, } = require("mineflayer-pathfinder");
const blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer);
const utils = __importStar(require("./utils"));
const accounts_json_1 = __importDefault(require("./accounts.json"));
const config_json_1 = __importDefault(require("./config.json"));
class MineBot {
    constructor(username) {
        this.bot = null;
        this.stats = {
            food: 0,
            health: 0,
            thirst: 0
        };
        this.getPassword = () => {
            if (!(accounts_json_1.default.hasOwnProperty(this.username))) {
                throw new Error('Заданный username не найден в accounts.json');
            }
            return accounts_json_1.default[this.username];
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
            this.mcData = require("minecraft-data")(config_json_1.default.server.version);
            //pathfinder
            const workingMove = new Movements(this.bot, this.mcData);
            workingMove.allow1by1towers = false;
            workingMove.allowParkour = false;
            workingMove.allowSprinting = true;
            this.bot.pathfinder.setMovements(workingMove);
            this.bot.pathfinder.thinkTimeout = 500;
            this.bot.pathfinder.tickTimeout = 20;
            this.InitEventHandlers();
        };
        this.login = () => {
            return new Promise((resolve) => {
                this.connectToServer();
                this.bot.on("spawn", () => __awaiter(this, void 0, void 0, function* () {
                    this.bot.chat(`/l ${this.password}`);
                    yield utils.delay(utils.randomIntFromInterval(10000, 20000));
                    return resolve();
                }));
            });
        };
        this.InitEventHandlers = () => {
            this.bot.on("kicked", (reason) => __awaiter(this, void 0, void 0, function* () {
                console.log(`Кик: \n${reason}\n`);
                yield utils.delay(utils.randomIntFromInterval(15000, 30000));
                yield this.bot.quit();
                yield this.bot.end();
                //bot_start();
                //throw new Error('Кик');
            }));
            this.bot.on("forcedMover", (reason) => __awaiter(this, void 0, void 0, function* () {
                this.bot.chat('Зигвимба');
                console.log(`Бот был принудительно перемещен на координаты: \n${this.bot.entity.position}\n`);
                yield utils.delay(1500);
                this.bot.quit();
            }));
            this.bot.on("error", (reason) => __awaiter(this, void 0, void 0, function* () {
                console.log(`Ошибка: \n${reason}\n`);
                yield utils.delay(1500);
                this.bot.quit();
                //bot_start();
            }));
            this.bot.on("chat", (username, message) => __awaiter(this, void 0, void 0, function* () {
                if (username === this.bot.username)
                    return;
                if (message.includes('таскай'))
                    return;
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
                console.log(msgText);
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
