const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const TransactionModel = require('../lib/db/model/transaction');
const UserModel = require('../lib/db/model/user');
const log = require('../lib/logger');
const util = require('../lib/util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('input')
        .setDescription(`Input a transaction into the tracker`)
        .addStringOption(option =>
            option.setName('description')
                .setDescription('What is this entry related to?')
                .setMaxLength(255) // can be increased if the need for it ever presents itself, but mongoose limitations should be tested before release
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('The amount going in or out')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('direction')
                .setDescription('Is this money coming in, or going out?')
                .setChoices({ name: 'in', value: 'in' }, { name: 'out', value: 'out' })
                .setRequired(true)),
    async execute(interaction) {
        log.info(`${interaction.user.username} used the input command`);

        const transRec = await TransactionModel.new(interaction);
        if (!transRec) {
            interaction.reply({ content: `Failed to save transaction in database!`, ephemeral: true });
            return log.error(`Could not register transaction in the database!`);
        }

        let userRec = await UserModel.findOne({ id: interaction.user.id });
        if (!userRec) userRec = await UserModel.new({ id: interaction.user.id, username: interaction.user.username });

        let balance = await TransactionModel.getBalance(interaction);
        let amount = transRec.direction == 'in' ? transRec.amount : transRec.amount * -1;
        balance = util.toCurrency(balance, interaction.locale, userRec.currency);
        amount = util.toCurrency(amount, interaction.locale, userRec.currency);

        const transactionEmbed = new EmbedBuilder()
            .setFooter({ text: `ID: ${transRec._id}`})
            .setColor(Colors.Green)
            .setFields(
                { name: 'Amount', value: `${amount}`, inline: true },
                { name: 'New balance', value: `${balance}`, inline: true },
                { name: 'Description', value: `${transRec.description}` },
            );

        interaction.reply({ embeds: [transactionEmbed], ephemeral: true });
    }
};