const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema(
    {
        id: Number,
        name: String,
        user: String ,                  // Snowflake
        
        lastModifiedBy: String,         // Snowflake
        lastModifiedAt: Date,
    },
    {
        // Available on records
        methods: {

        },
        // Available on table
        statics: {
            
        }
    }
)

module.exports = mongoose.model('ledgers', ledgerSchema);