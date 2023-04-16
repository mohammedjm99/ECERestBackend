const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inProgressOrderSchema = new Schema({
    table: {
        _id: {
            type: String,
            required: true
        },
        number: {
            type: Number,
            required: true,
        },
    },
    products: [
        {
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            _id: false
        }
    ],
    status: {
        type: Number,
        default: 0
    },
    msg: {
        type: String,
        default: ""
    }
})

module.exports = mongoose.model('inprogressorder', inProgressOrderSchema);