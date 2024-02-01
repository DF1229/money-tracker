const fs = require('fs');
const LogModel = require('../lib/db/model/log');

async function log(level, message) {
    const logRec = await LogModel.new(level, message);
    if (!logRec) console.error('Failed to save log in database');

    console.log(getLogString(logRec));
}

function getLogString(logRec) {
    const dateIsoString = logRec.createdAt.toISOString();
    const level = logRec.level;
    const message = logRec.message;

    return `${dateIsoString} | ${level} | ${message}`;
}

module.exports = {
    // Significant event, but nothing special
    info(message) {
        log('INFO', message);
    },
    // Relevant to debugging, should not be used in production
    debug(message) {
        log('DEBUG', message);
    },
    // Something happened to influence the outcome of a command, but there was still a succesfull result to show to the user
    warn(message) {
        log('WARNING', message);
    },
    // A non-fatal error occured, the bot is still online, but there was no output to show to the user
    error(message) {
        log('ERROR', message);
    },
    // A fatal error occured, the bot is no longer online, and the user did not get a response to their command
    fatal(message) {
        log('FATAL', message);
    }
}