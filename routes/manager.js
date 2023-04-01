const Manager = require('../models/Manager');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {verifyTokenAndAdmin} = require('../controllers/verify');

router.post('/',verifyTokenAndAdmin,async(req,res,next)=>{
    const {username,password,rule} = req.body;
    if(!rule || !username || !password) return res.status(400).json('please fill all inputs...');
    try{
        const hashedPassword = await bcrypt.hash(password,10);
        const newManager = new Manager({
            username,
            password:hashedPassword,
            rule
        });
        await newManager.save();
        res.status(200).json(newManager);
    }catch(e){
        if(e.message.includes('E11000')) return res.status(400).json('Username already exists.');
        else res.status(400).json("Can't add manager.");
    }

});

router.post('/login',async(req,res)=>{
    const {username,password} = req.body;
    try{
        const manager = await Manager.findOne({username});
        if(!manager) return res.status(400).json('Wrong username or password');
        const checkPassword = await bcrypt.compare(password,manager.password);
        if(!checkPassword) return res.status(400).json('Wrong username or password');
        const token = jwt.sign({_id:manager._id,rule:manager.rule},process.env.JWT_SECRET,{expiresIn:'1d'});
        res.status(200).json(token);
    }catch(e){
        res.status(400).json("Can't login.")
    }
})

module.exports = router;