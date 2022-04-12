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
const utils = __importStar(require("../../utils"));
const config_json_1 = __importDefault(require("../../config/config.json"));
class CargoDelivery {
    constructor(botDoings) {
        this.gotoHalfPath = () => {
            const pathVariantNumber = utils.randomIntFromInterval(0, 2);
            const pathCoord = config_json_1.default.coords.halfPathCoords[pathVariantNumber];
            return this.botDoings.gotoCoords(pathCoord);
        };
        this.work = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const startTimeMs = performance.now();
                //Идти к промежуточной координате
                yield this.gotoHalfPath();
                //Идти к месту сбора материалов
                yield this.botDoings.gotoCoords(config_json_1.default.coords.takingBlock);
                yield utils.delay(50);
                //Взять материалы
                const num = config_json_1.default.coords.block;
                // @ts-ignore
                yield this.botDoings.blockClick(...num);
                yield utils.delay(50);
                //Идти к промежуточной координате
                yield this.gotoHalfPath();
                //Идти к месту сдачи материалов
                yield this.botDoings.gotoCoords(config_json_1.default.coords.putingBlock);
                yield utils.delay(50);
                //Сдать материалы
                // @ts-ignore
                yield this.botDoings.blockClick(...config_json_1.default.coords.sign);
                yield utils.delay(50);
                const finishTimeMs = performance.now() - startTimeMs;
                return resolve(finishTimeMs);
            }));
        };
        this.botDoings = botDoings;
    }
}
exports.default = CargoDelivery;
