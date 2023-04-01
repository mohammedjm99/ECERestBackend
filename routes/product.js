const router = require('express').Router();
const {verifyTokenAndAdmin} = require('../controllers/verify');
const Product = require('../models/Product');

router.post('/',async(req,res)=>{
    const newProduct = new Product(req.body);
    try{
        await newProduct.save();
        res.status(200).json(newProduct);
    }catch(e){
        res.status(400).json("can't add product.")
    }
});

router.get('/',async(req,res)=>{
    try{
        const products = await Product.find();
        res.status(200).json(products);
    }catch(e){
        res.status(400).json("can't get products.")
    }
});

router.get('/:id',async(req,res)=>{
    try{
        const product = await Product.findById(req.params.id);
        if(!product) return res.status(400).json("No product found");
        res.status(200).json(product);
    }catch(e){
        res.status(400).json("can't get product.")
    }
});

router.delete('/:id',verifyTokenAndAdmin,async(req,res)=>{
    try{
        const product = await Product.findByIdAndDelete(req.params.id);
        if(!product) return res.status(400).json("No product found to delete");
        res.status(200).json(product);
    }catch(e){
        res.status(400).json("can't delete product.")
    }
});

module.exports = router;