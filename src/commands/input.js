const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const { toCurrency, isValidDate, replyError } = require('../lib/util');
const TransactionModel = require('../lib/db/model/transaction');
const UserModel = require('../lib/db/model/user');
const log = require('../lib/logger');
const moment = require('moment');

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
                .setRequired(true))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('DD/MM/YYYY: Date the transaction occurred, can only lay in the past')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('currency')
                .setDescription('Optional. Override the currency to be used, defaults to your saved value, or USD')
                .setRequired(false)
                .setChoices(
                    { name: 'US Dollar', value: 'USD' },
                    { name: 'Euro', value: 'EUR' }
                )
        ),
    async execute(interaction) {
        log.info(`${interaction.user.username} used the input command`);

        let date = interaction.options.getString('date');
        if (date) {
            date = moment(date, 'DD-MM-YYYY', true).toDate();

            if (!isValidDate(date))
                return replyError(interaction, `Date '${interaction.options.getString('date')}' not of recognizable format, did you use DD-MM-YYYY?`);

            if (date > Date.now())
                return replyError(interaction, `Date '${date.toDateString()}' is in the future.`);
        }

        const transRec = await TransactionModel.new(interaction);
        if (!transRec) {
            log.error(`Could not register transaction in the database!`);
            return replyError(interaction, 'Failed to save transaction in database!');
        }

        let userRec = await UserModel.findOne({ id: interaction.user.id });
        if (!userRec) userRec = await UserModel.new(interaction);

        let balance = await TransactionModel.getBalance(interaction);
        let amount = transRec.direction == 'in' ? transRec.amount : transRec.amount * -1;
        balance = toCurrency(balance, interaction.locale, userRec.currency);
        amount = toCurrency(amount, interaction.locale, transRec.currency);

        const transactionEmbed = new EmbedBuilder()
            .setFooter({ text: `ID: ${transRec._id}` })
            .setColor(Colors.Green)
            .setFields(
                { name: 'Date', value: `${transRec.date.toDateString()}`, inline: true },
                { name: 'Amount', value: `${amount}`, inline: true },
                { name: 'New balance', value: `${balance}`, inline: true },
                { name: 'Description', value: `${transRec.description}` },
            );

        interaction.reply({ embeds: [transactionEmbed], ephemeral: true });
    }
};