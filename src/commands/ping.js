const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const { msToString } = require('../lib/util');
const log = require('../lib/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription(`Get some info about the bot's status`),
    async execute(interaction) {
        log.info(`${interaction.user.username} used the ping command`);
        
        const pingStart = new EmbedBuilder()
            .setColor(Colors.White)
            .setTitle('Ping :ping_pong: Pong')
            .setTimestamp()
            .addFields(
                { name: 'Ping to bot', value: `pinging...`, inline: true },
                { name: 'API heartbeat', value: `pinging...`, inline: true },
                { name: 'Uptime', value: `pinging...`, inline: true },
            );

        const sent = await interaction.reply({ embeds: [pingStart], fetchReply: true });

        const pingResult = new EmbedBuilder()
            .setColor(Colors.White)
            .setTitle('Ping :ping_pong: Pong')
            .setTimestamp()
            .addFields(
                { name: 'Ping to bot', value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`, inline: true },
                { name: 'API heartbeat', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true },
                { name: 'Uptime', value: `${msToString(interaction.client.uptime)}`, inline: true },
            );

        await interaction.editReply({ content: null, embeds: [pingResult] });
    }
};