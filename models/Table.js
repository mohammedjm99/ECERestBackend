const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    number: {
        type: Number,
        required: true,
        unique: true
    },
    distance: {
        type: Number,
        required: true,
        unique: true
    },
    secret: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('table',userSchema);