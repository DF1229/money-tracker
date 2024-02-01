const { Events } = require('discord.js');
const log = require('../lib/logger');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        log.info(`Bot ready! Logged in as ${client.user.tag}`); // bots still use discriminators, hence the usages of user.tag instead of user.username
    }
}