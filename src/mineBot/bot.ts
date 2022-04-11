const mineflayer = require("mineflayer");
const proxyAgent = require('proxy-agent');
const socks = require('socks').SocksClient;
const { pathfinder, Movements } = require("mineflayer-pathfinder");
const blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer);

import main from "../main";
import * as utils from "../utils";
import BotInventory from './inventory';
import BotDoings from './doings';
import { Work, BotWork } from './working';
import CargoDelivery from './works/cargoDelivery';

import accounts from '../config/accounts.json';
import config from '../config/config.json';

export default class MineBot {
    private readonly password: string;
    private payMoneyOwner: boolean = false;

    public inventory: BotInventory;
    public doings: BotDoings;

    public readonly mcData: any = require("minecraft-data")(config.server.version);
    public readonly username: string;
    public bot: any = null;

    public stats: {
        food: number,
        health: number,
        thirst: number,
        money: number
    } = {
            food: 0,
            health: 0,
            thirst: 0,
            money: 0
        };

    constructor(username: string) {
        this.username = username;
        this.password = this.getPassword();
    }

    private getPassword = (): string => {
        if (!(accounts.hasOwnProperty(this.username))) {
            throw new Error('Заданный username не найден в accounts.json');
        }

        return accounts[this.username];
    }

    public getSalaryPerHour = (workingLoopTimeMs) => {
        return (3600 / (workingLoopTimeMs / 1000)) * 20;
    }

    private connectToServer = (): void => {
        const connectProperties: {
            host: string,
            port: number,
            username: string,
            version: string
        } = {
            host: config.server.host,
            port: config.server.port,
            username: this.username,
            version: config.server.version
        };

        this.bot = mineflayer.createBot(connectProperties);

        //plugins
        this.bot.loadPlugin(pathfinder);
        this.bot.loadPlugin(blockFinderPlugin);

        //pathfinder
        const workingMove = new Movements(this.bot, this.mcData);
        workingMove.allow1by1towers = false;
        workingMove.allowParkour = false;
        workingMove.allowSprinting = true;
        this.bot.pathfinder.setMovements(workingMove);
        this.bot.pathfinder.thinkTimeout = 500;
        this.bot.pathfinder.tickTimeout = 20;

        this.inventory = new BotInventory(this);
        this.doings = new BotDoings(this);

        return this.initEventHandlers();
    }

    private reLogin = async () => {
        const relogAfterMs: number = utils.randomIntFromInterval(30000, 120000);
        console.log(`Перезагрузка через ${relogAfterMs} ms`);
        await utils.delay(relogAfterMs);

        main();
    };

    public login = (): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            this.connectToServer();

            this.bot.on("spawn", async () => {
                this.bot.chat(`/l ${this.password}`);
                await utils.delay(utils.randomIntFromInterval(10000, 20000));

                return resolve();
            });
        });
    }

    public work = (): Promise<void> => {
        return new Promise(async (reject) => {
            const workHandler: Work = new CargoDelivery(this.doings);
            const currentWork: BotWork = new BotWork(this, workHandler);

            await currentWork.working();
            return reject();
        });
    }

    private initEventHandlers = (): void => {
        this.bot.on("kicked", async (reason) => {
            console.log(`Кик: \n${reason}\n`);
            await utils.delay(utils.randomIntFromInterval(15000, 30000));

            this.reLogin();
        });

        this.bot.on("forcedMover", async (reason) => {
            this.bot.chat('Зигвимба');
            console.log(`Бот был принудительно перемещен на координаты: \n${this.bot.entity.position}\n`);
            await utils.delay(1500);

            this.bot.quit();
            this.bot.end();
        });

        this.bot.on("error", async (reason) => {
            console.log(`Ошибка: \n${reason}\n`);

            this.reLogin();
        });

        this.bot.on("chat", async (username, message) => {
            if (username === this.bot.username) return;
            if (message.includes('таскай')) return;

            if (message.includes('зигвимба') && message.includes('Сеспель')) {
                this.payMoneyOwner = true;
            }

            console.log(`(чат) ${message}`);
        });

        this.bot.on("message", async (jsonMsg, position) => {
            //Фильтр вывода баланса
            if (!jsonMsg.extra) {
                return;
            }

            const msgType = jsonMsg.extra[0].text;
            if (msgType != 'Баланс:') {
                return;
            }

            const msgText = jsonMsg.extra[1].text.trim();
            const balanceNum: number = Number.parseInt(msgText.replace('$', '').replace(',', ''));
            console.log(`Баланс: ${balanceNum} $`);

            if (this.payMoneyOwner) {
                const payDelay: number = utils.randomIntFromInterval(30000, 120000);
                this.payMoneyOwner = false;

                setInterval(() => {
                    console.log(`Выплата ${config.owner.username} пройдет через ${payDelay}`);
                    this.bot.chat(`/pay ${config.owner.username} ${balanceNum}`);
                    console.log(`Выплата ${config.owner.username} в размере ${balanceNum}$ прошла успешно`);
                }, payDelay);
            }
        });

        this.bot.on("bossBarUpdated", async (bossBar) => {
            this.stats.thirst = bossBar.health;
        });

        this.bot.on("health", async () => {
            if (this.stats.food == this.bot.food) {
                return;
            }

            this.stats.food = this.bot.food;
        });
    }
}