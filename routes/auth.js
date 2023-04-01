const router = require('express').Router();
const Table = require('../models/Table');
const jwt = require('jsonwebtoken');
const {verifyToken,verifyTokenAndAdmin,verifyTokenAndChief} = require('../controllers/verify');

router.get('/login/:secret', async(req,res)=>{
    try{
        const [tableNumber,secret] = req.params.secret.split('$');
        if(!tableNumber || !secret) return res.status(400).json("Invalid QR Code.");
        const table = await Table.findOne({number: tableNumber});
        if(!table) return res.status(400).json("Invalid QR Code.");
        if(table.secret !== secret) return res.status(400).json("Invalid QR Code.");
        const accessToken = jwt.sign({_id: table._id,number: table.number},process.env.JWT_SECRET,{expiresIn:"1d"});
        res.status(200).json(accessToken);
    }catch(e){
        res.status(400).json("Internal server error.")
    }
});

router.get('/requiretable' ,verifyToken,(req,res)=>{
    res.status(200).json();
});

router.get('/requirechief' ,verifyTokenAndChief,(req,res)=>{
    res.status(200).json();
});

router.get('/requireadmin' ,verifyTokenAndAdmin,(req,res)=>{
    res.status(200).json();
});

module.exports = router;