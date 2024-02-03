const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const TransactionModel = require('../lib/db/model/transaction');
const UserModel = require('../lib/db/model/user');
const log = require('../lib/logger');
const util = require('../lib/util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Show your current balance'),
    async execute(interaction) {
        log.info(`${interaction.user.username} used the balance command`);

        let userRec = await UserModel.findOne({ id: interaction.user.id });
        if (!userRec) userRec = await UserModel.new({ id: interaction.user.id, username: interaction.user.username });
        
        let balance = await TransactionModel.getBalance(interaction);
        balance = util.toCurrency(balance, interaction.locale, userRec.currency);

        const replyEmbed = new EmbedBuilder()
            .setColor(Colors.Aqua)
            .setFields({ name: 'Balance', value: `${balance}` });

        interaction.reply({ embeds: [replyEmbed], ephemeral: true });
    }
}