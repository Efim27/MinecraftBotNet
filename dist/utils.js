"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.randomIntFromInterval = exports.getCurrentBotUsername = exports.getScriptArgs = void 0;
const getScriptArgs = () => {
    return process.argv.slice(2);
};
exports.getScriptArgs = getScriptArgs;
const getCurrentBotUsername = () => {
    return (0, exports.getScriptArgs)()[0];
};
exports.getCurrentBotUsername = getCurrentBotUsername;
const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
exports.randomIntFromInterval = randomIntFromInterval;
const delay = (ms, timemiss = 20) => {
    return new Promise(resolve => {
        setTimeout(() => {
            return resolve();
        }, (0, exports.randomIntFromInterval)(ms - timemiss, ms + timemiss));
    });
};
exports.delay = delay;
