const { CommandInteraction } = require('discord.js');
const UserModel = require('../model/user');
const mongoose = require('mongoose');
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
            /**
             * @param { CommandInteraction } interaction The original interaction as passed to the command's execute function
             * @returns { Number } User's balance as a number
             */
            async getBalance(interaction) {
                const transactionRec = await this.findOne({ user: interaction.user.id }).sort({ _id: -1 });
                if (!transactionRec) return 0;

                return transactionRec.balance;
            }
        }
    }
)

module.exports = mongoose.model('transactions', transactionSchema);