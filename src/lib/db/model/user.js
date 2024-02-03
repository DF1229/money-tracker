const mongoose = require('mongoose');
const log = require('../../logger');

const userSchema = new mongoose.Schema(
    {
        id: String,                     // Snowflake
        username: String,
        currency: { type: String, default: 'USD' },

        lastModifiedBy: String,          // Snowflake
        lastModifiedAt: { type: Date, default: Date.now() }
    },
    {
        // Available on records
        methods: {
            async setCurrency(value) {
                this.currency = value;
                this.lastModifiedAt = Date.now();
                await this.save();
            }
        },
        // Available on table
        statics: {
            async new(data) {
                try {
                    var nRec = await this.create({
                        id: data.id,
                        username: data.username,
                        lastModifiedBy: data.id
                    });
                } catch(err) {
                    console.error(err);
                    log.error(err.message);
                    return false;
                }

                if (!data.currency) 
                    return nRec;
                else {
                    nRec.currency = data.currency;
                    await nRec.save();
                    return nRec;
                }
            }
        }
    }
);

module.exports = mongoose.model('users', userSchema);