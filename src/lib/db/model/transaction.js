const { CommandInteraction } = require('discord.js');
const { isValidDate } = require('../../util');
const UserModel = require('../model/user');
const mongoose = require('mongoose');
const log = require('../../logger');
const moment = require('moment');

const transactionSchema = new mongoose.Schema(
    {
        user: String,                   // Snowflake
        date: Date,
        amount: Number,
        ledger: Number,                 // Ledger ID
        direction: { type: String, enum: ['in', 'out'] },
        description: String,
        currency: { type: String, default: 'USD' },
        balance: Number,

        lastModifiedBy: String,         // Snowflake
        lastModifiedAt: { type: Date, default: Date.now() },
    },
    {
        // Available on records
        methods: {

        },
        // Available on table
        statics: {
            async new(interaction) {
                const amount = interaction.options.getNumber('amount');
                const direction = interaction.options.getString('direction');
                const description = interaction.options.getString('description');
                const user = interaction.user.id;

                let currency = interaction.options.getString('currency'); // optional
                let date = interaction.options.getString('date'); // optional

                if (date) date = moment(date, 'DD-MM-YYYY').toDate();
                else date = Date.now();

                let userRec = await UserModel.findOne({ id: user });
                if (!userRec) userRec = await UserModel.new(interaction);
                if (!currency) currency = userRec.currency;

                let balance = await this.getBalance(interaction);
                if (direction === 'in')
                    balance += amount;
                else if (direction === 'out')
                    balance -= amount;

                try {
                    var nRec = await this.create({
                        date,
                        user,
                        amount,
                        ledger: 0,  // TODO
                        direction,
                        description,
                        currency,
                        balance,

                        lastModifiedBy: user,
                        lastModifiedAt: Date.now()
                    });
                } catch (err) {
                    console.error(err);
                    return false;
                }
                return nRec;
            },
            async bulkNew(interaction, data) {
                data.user = interaction.user.id;
                data.direction = data.amount >= 0 ? 'in' : 'out';
                data.amount = data.amount >= 0 ? data.amount : data.amount * -1;

                const userRec = await UserModel.findOne({ id: data.user });
                if (!data.currency) data.currency = userRec.currency;

                // console.log(data.date);
                data.date = moment(data.date, 'DD/MM/YYYY', true).toDate();
                if (!isValidDate(data.date)) return false;

                // console.dir(data);

                try {
                    var nRec = await this.create({
                        user: data.user,
                        date: data.date,
                        amount: data.amount,
                        direction: data.direction,
                        description: data.description,
                        currency: data.currency,
                        balance: undefined
                    });
                } catch (err) {
                    log.error(err.message);
                    // console.error(err);
                    return false;
                }

                return nRec;
            },
            async recalculateBalance(interaction) {
                const user = interaction.user.id;
                // console.log(user);
                const transactions = await this.find({ user }).sort({ date: 1 });
                // console.dir(transactions);

                let balance = 0;
                console.log(`Bal: ${balance}`);
                transactions.forEach(async rec => {
                    if (rec.direction === 'in') balance += rec.amount;
                    else if (rec.direction === 'out') balance -= rec.amount;
                    console.log(`dir: ${rec.direction}, amount: ${rec.amount}, bal: ${balance}`);

                    rec.balance = balance;
                    await rec.save();
                });

                return balance;
            },
            /**
             * @param { CommandInteraction } interaction The original interaction as passed to the command's execute function
             * @returns { Number } User's balance as a number
             */
            async getBalance(interaction) {
                const transactionRec = await this.findOne({ user: interaction.user.id }).sort({ date: -1, _id: -1 });
                if (!transactionRec) return 0;

                return transactionRec.balance;
            },
            async clearAll(interaction) {
                return await this.deleteMany({
                    user: interaction.user.id
                });
            }
        }
    }
)

module.exports = mongoose.model('transactions', transactionSchema);