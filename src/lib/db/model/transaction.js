const { CommandInteraction } = require('discord.js');
const UserModel = require('../model/user');
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        user: String,                   // Snowflake
        date: { type: Date, default: Date.now() },
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
                let currency = interaction.options.getString('currency'); // optional
                const direction = interaction.options.getString('direction');
                const description = interaction.options.getString('description');
                const user = interaction.user.id;

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
                        user,
                        amount,
                        ledger: 0,  // TODO
                        direction,
                        description,
                        currency,
                        balance,
                        lastModifiedBy: user,
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
                const transactionRec = await this.findOne({ user: interaction.user.id }).sort({ date: -1 });
                if (!transactionRec) return 0;

                return transactionRec.balance;
            }
        }
    }
)

module.exports = mongoose.model('transactions', transactionSchema);