const mongoose = require('mongoose');
const util = require('../../util');

const transactionSchema = new mongoose.Schema(
    {
        user: String,                   // Snowflake
        date: { type: Date, default: Date.now() },
        amount: Number,
        ledger: Number,                 // Ledger ID
        direction: { type: String, enum: ['in', 'out'] },

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
                const user = interaction.user.id;

                try {
                    var nRec = await this.create({
                        user,
                        amount,
                        ledger: 0,  // TODO
                        direction,
                        lastModifiedBy: user,
                    });
                } catch (err) {
                    console.error(err);
                    return false;
                }
                return nRec;
            },
            async getBalance(user) {
                const transactions = await this.find({ user }).exec();

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
                
                return util.roundTo(balance, 2);
            }
        }
    }
)

module.exports = mongoose.model('transactions', transactionSchema);