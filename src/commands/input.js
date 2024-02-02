const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const TransactionModel = require('../lib/db/model/transaction');
const log = require('../lib/logger');
const util = require('../lib/util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('input')
        .setDescription(`Input a transaction into the tracker`)
        .addStringOption(option =>
            option.setName('direction')
                .setDescription('Is this money coming in, or going out?')
                .setChoices({ name: 'in', value: 'in' }, { name: 'out', value: 'out' })
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('The amount going in or out')
                .setRequired(true)),
    async execute(interaction) {
        log.info(`${interaction.user.username} used the input command`);

        const transRec = await TransactionModel.new(interaction);
        if (!transRec) {
            interaction.reply({ content: `Failed to save transaction in database!`, ephemeral: true });
            return log.error(`Could not register transaction in the database!`);
        }

        const balance = await TransactionModel.getBalance(interaction);
        const amount = util.toCurrency(transRec.amount, interaction.locale);
        const transactionEmbed = new EmbedBuilder()
            .setTitle(`Transaction #${transRec._id}`) // TODO: auto-incremented transaction ID's
            .setColor(Colors.Green)
            .setFields(
                { name: 'Amount', value: `${amount}`, inline: true },
                { name: 'Direction', value: `${transRec.direction}`, inline: true },
                { name: 'New balance', value: `${balance}`}
            );

        interaction.reply({ embeds: [transactionEmbed], ephemeral: true });
    }
};