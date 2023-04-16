const router = require('express').Router();
const Table = require('../models/Table');
const {verifyTokenAndChief} = require('../controllers/verify');
const crypto = require('crypto');

router.get('/', async(req,res)=>{
    try{
        const tables = await Table.find();
        res.status(200).json(tables);
    }catch(e){
        res.status(400).json(e.message);
    }
});

router.get('/single/:id', async(req,res)=>{
    try{
        const table = await Table.findById(req.params.id);
        res.status(200).json(table);
    }catch(e){
        res.status(400).json(e.message);
    }
});

router.post('/',async(req,res)=>{
    const {number,distance} = req.body;
    const newTable = new Table({number,distance,secret:crypto.randomBytes(5).toString('hex')});
    try{
        await newTable.save();
        res.status(200).json(newTable);
    }catch(e){
        res.status(400).json(e.message);
    }
});

router.put('/qr/:id', async(req,res)=>{
    try{
        const updatedTable = await Table.findByIdAndUpdate(req.params.id,{
            $set:{
                secret: crypto.randomBytes(5).toString('hex')
            }
        },{new:true});
        if(!updatedTable) return res.status(400).json('No table found to update...');
        res.status(200).json(updatedTable);
    }catch(e){
        res.status(400).json('Cant update table...');
    }
});

router.put('/single/:id', async(req,res)=>{
    try{
        const updatedTable = await Table.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true});
        if(!updatedTable) return res.status(400).json('No table found to update...');
        res.status(200).json(updatedTable);
    }catch(e){
        res.status(400).json('Cant update table...');
    }
});

router.delete('/:id',async(req,res)=>{
    try{
        const deletedTable = await Table.findByIdAndDelete(req.params.id);
        if(!deletedTable) return res.status(400).json('No table found to delete...');
        res.status(200).json(deletedTable);
    }catch(e){
        res.status(400).json('Table not deleted...');
    }
})

module.exports = router;