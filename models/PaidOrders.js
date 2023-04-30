const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paidOrderSchema = new Schema({
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
    createdAt: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 10800000);
        }
    }
})

module.exports = mongoose.model('paidorder', paidOrderSchema);