const TransactionModel = require('../lib/db/model/transaction');
const { SlashCommandBuilder } = require('discord.js');
const log = require('../lib/logger');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('history')
        .setDescription(`Show transaction history`),
    async execute(interaction) {
        log.info(`${interaction.user.username} used the history command`);
        const transactions = await TransactionModel.find({ user: interaction.user.id });

        let transactionData = 'date;amount\n';
        transactions.forEach(rec => {
            const direction = rec.direction == 'out' ? '-' : '';
            transactionData += `${rec.date.toISOString()};${direction}${rec.amount}\n`;
        });

        const transactionFile = `/tmp/transactions.csv`;
        fs.writeFileSync(transactionFile, transactionData);

        interaction.reply({ files: [{ attachment: transactionFile, name: `transactions.csv`}], ephemeral: true });
    }
};