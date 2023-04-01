const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inProgressOrderSchema = new Schema({
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
    status: {
        type: Number,
        default: 0
    },
    msg:{
        type: String,
        default: ""
    }
})

module.exports = mongoose.model('inprogressorder',inProgressOrderSchema);