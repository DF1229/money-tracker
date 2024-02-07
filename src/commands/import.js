const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const TransactionModel = require('../lib/db/model/transaction');
const { replyError, toCurrency } = require('../lib/util');
const UserModel = require('../lib/db/model/user');
const csv = require('csv-parse/sync');
const log = require('../lib/logger');
const moment = require('moment');

module.exports = {
    active: false,
    data: new SlashCommandBuilder()
        .setName('import')
        .setDescription(`Import transaction history from CSV`)
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('The file to be used for the import')
                .setRequired(true)),
    async execute(interaction) {
        log.info(`${interaction.user.username} used the import command`);

        await interaction.deferReply({ ephemeral: true });
        const attachment = interaction.options.getAttachment('file');
        if (!attachment)
            return replyError(interaction, 'File not found, upload failed');
        if (!attachment.name.endsWith('.csv'))
            return replyError(interaction, 'File is not .csv');
        if (!attachment.contentType.startsWith('text/csv'))
            return replyError(interaction, 'File is of the wrong content-type');

        const res = await fetch(attachment.url);
        if (!res.ok)
            return replyError(interaction, 'Could not download file from Discord');

        const data = await res.text();
        if (!data)
            return replyError(interaction, 'Unknown internal error');

        let records;
        try {
            records = await csv.parse(data, {
                delimiter: ';',
                columns: true,
                cast: true,
                cast_date: true,
            });
        } catch (err) {
            log.error(`Error processing import: ${err.code}: ${err.message}`);
            return replyError(interaction, `CSV processing error: ${err.code}`);
        }

        // TODO: confirm with user to overwrite existing transaction history
        const confirm = true;
        if (confirm)
            await TransactionModel.clearAll(interaction);

        const userRec = await UserModel.findOne({ id: interaction.user.id });
        const transactions = await TransactionModel.find({ user: interaction.user.id });
        let balance = await handleRecords(interaction, records);
        balance = toCurrency(balance, interaction.locale, userRec.currency);

        const embed = new EmbedBuilder()
            .setTitle('Transaction import results')
            .setColor(Colors.Blurple)
            .setFields(
                { name: 'Total transactions', value: `${transactions.length}`, inline: true },
                { name: 'New balance', value: `${balance}` },
            );
        interaction.followUp({ embeds: [embed], ephemeral: true });
    }
};

async function handleRecords(interaction, records) {
    records.sort((a, b) => (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0));
    records.forEach(async rec => {
        // console.dir(rec);
        if (typeof rec.amount !== 'number')
            return replyError(interaction, `Amount '${rec.amount}' could not be converted to a number, record ID: ${rec.id}`);

        if (!rec.date instanceof Date) rec.date = moment(rec.date, 'DD-MM-YYYY', true).toDate();
        const nRec = await TransactionModel.bulkNew(interaction, {
            date: rec.date,
            amount: rec.amount,
            description: rec.description.trim(),
            currency: rec.currency
        });

        if (!nRec) return replyError(interaction, `Something went wrong while processing record with ID ${rec.id}`);
    });

    setTimeout(async () => {
        return await TransactionModel.recalculateBalance(interaction);
    }, 1000);
}