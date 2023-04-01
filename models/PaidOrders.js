const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paidOrderSchema = new Schema({
    table: {
        type: Schema.Types.ObjectId,
        ref: 'table',
        required:true,
    },
    products:[
        {
            product:{
                type: Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },
            quantity:{
                type:Number,
                required:true
            },
            _id:false
        }
    ],
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('paidorder',paidOrderSchema);