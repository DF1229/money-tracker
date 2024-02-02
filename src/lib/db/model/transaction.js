const { CommandInteraction } = require('discord.js');
const mongoose = require('mongoose');
const util = require('../../util');

const transactionSchema = new mongoose.Schema(
    {
        user: String,                   // Snowflake
        date: { type: Date, default: Date.now() },
        amount: Number,
        ledger: Number,                 // Ledger ID
        direction: { type: String, enum: ['in', 'out'] },
        description: String,

        lastModifiedBy: String,         // Snowflake
        lastModifiedAt: {type: Date, default: Date.now() },
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
                const description = interaction.options.getString('description')
                const user = interaction.user.id;

                try {
                    var nRec = await this.create({
                        user,
                        amount,
                        ledger: 0,  // TODO
                        direction,
                        description,
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
             * @returns { String } User's formatted balance as a string
             */
            async getBalance(interaction) {
                const transactions = await this.find({ user: interaction.user.id }).exec();
                
                // TODO: improve balance calculation, this is O(n)
                let balance = 0;
                transactions.forEach(rec => {
                    switch (rec.direction) {
                        case 'in':
                            balance += rec.amount;
                            break;
                        case 'out':
                            balance -= rec.amount;
                            break;
                    }
                })
                
                return util.toCurrency(balance, interaction.locale);
            }
        }
    }
)

module.exports = mongoose.model('transactions', transactionSchema);