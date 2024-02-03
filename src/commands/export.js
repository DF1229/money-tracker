const TransactionModel = require('../lib/db/model/transaction');
const { SlashCommandBuilder } = require('discord.js');
const log = require('../lib/logger');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('export')
        .setDescription(`Export transaction history to CSV`),
    async execute(interaction) {
        log.info(`${interaction.user.username} used the history command`);
        const transactions = await TransactionModel.find({ user: interaction.user.id });

        let transactionData = 'id;date;currency;amount;description;balance\n';
        transactions.forEach(rec => {
            const direction = rec.direction == 'out' ? '-' : '';

            transactionData += `${rec._id};`;
            transactionData += `${rec.date.toISOString()};`;
            transactionData += `${rec.currency};`;
            transactionData += `${direction}${rec.amount};`;
            transactionData += `${rec.description};`;
            transactionData += `${rec.balance}\n`;
        });

        const transactionFile = `/tmp/transactions.csv`;
        fs.writeFileSync(transactionFile, transactionData);

        interaction.reply({ files: [{ attachment: transactionFile, name: `transactions.csv`}], ephemeral: true });
    }
};