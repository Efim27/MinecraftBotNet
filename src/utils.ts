export const getScriptArgs = () => {
    return process.argv.slice(2);
}

export const getCurrentBotUsername = () => {
    return getScriptArgs()[0];
}

export const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export const delay = (ms, timemiss = 20): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            return resolve();
        }, randomIntFromInterval(ms - timemiss, ms + timemiss));
    });
};