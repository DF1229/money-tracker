require('dotenv').config({ path: '../.env' });
require('./lib/db/database').connect();

const path = require('node:path');
const log = require('./lib/logger')
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const fs = require('node:fs');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const eventsPath = path.join(__dirname, 'events');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command)
        client.commands.set(command.data.name, command);
    else
        log.warn(`The command at ${filePath} is missing a required property.`);
}

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    
    if (event.once)
        client.once(event.name, (...args) => event.execute(...args));
    else
        client.on(event.name, (...args) => event.execute(...args));
}

client.login(process.env.DISCORD_TOKEN);