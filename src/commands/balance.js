const TransactionModel = require('../lib/db/model/transaction');
const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const log = require('../lib/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Show your current balance'),
    async execute(interaction) {
        log.info(`${interaction.user.username} used the balance command`);

        const balance = await TransactionModel.getBalance(interaction.user.id);
        const replyEmbed = new EmbedBuilder()
            .setTitle(`Balance for ${interaction.user.tag}`)
            .setColor(Colors.Aqua)
            .setFields({ name: 'Balance', value: `${balance}` });

        interaction.reply({ embeds: [replyEmbed], ephemeral: true });
    }
}