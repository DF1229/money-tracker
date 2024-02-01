const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
    {
        createdAt: { type: Date, default: Date.now() },
        level: String,
        message: String
    },
    {
        // Available on records
        methods: {

        },
        // Available on table
        statics: {
            async new(level, message) {
                try {
                    const nRec = await this.create({ level, message });
                    return (nRec) ? nRec : false;
                } catch (err) {
                    if (err) throw err;
                    return false;
                }
            }
        }
    }
)

module.exports = mongoose.model('log', logSchema);