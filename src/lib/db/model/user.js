const mongoose = require('mongoose');
const util = require('../../util');

const userSchema = new mongoose.Schema(
    {
        id: String,                     // Snowflake
        username: String,
        curreny: { type: String, enum: util.supportedCurrencies },

        lastModifiedBy: String,          // Snowflake
        lastModifiedAt: { type: Date, default: Date.now() }
    },
    {
        // Available on records
        methods: {

        },
        // Available on table
        statics: {

        }
    }
);

module.exports = mongoose.model('users', userSchema);