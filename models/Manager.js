const mongoose = require('mongoose');

const managerSchema = mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    rule:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('manager',managerSchema);