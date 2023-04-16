const router = require('express').Router();
const { verifyTokenAndAdmin } = require('../controllers/verify');
const Product = require('../models/Product');

router.post('/', async (req, res) => {
    const newProduct = new Product(req.body);
    try {
        await newProduct.save();
        res.status(200).json(newProduct);
    } catch (e) {
        res.status(400).json("can't add product.")
    }
});

router.put('/:id', async (req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id,{
            $set:req.body
        })
        res.status(200).json();
    } catch (e) {
        res.status(400).json("can't add product.")
    }
});

router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (e) {
        res.status(400).json("can't get products.")
    }
});

router.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(400).json("No product found");
        res.status(200).json(product);
    } catch (e) {
        res.status(400).json("can't get product.")
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(400).json("No product found to delete");
        res.status(200).json(product);
    } catch (e) {
        res.status(400).json("can't delete product.");
    }
});

router.get('/categories', async (req, res) => {
    try {
        const categories = await Product.aggregate([
            { $group: { _id: null, categories: { $addToSet: "$category" } } },
            { $project: { _id: 0, categories: 1 } }
        ])
        res.status(200).json(categories[0].categories);
    } catch (e) {
        res.status(400).json("can't get categories.")
    }
})

router.get('/ve/:id', async (req, res) => {
    try {
        const categories = await Product.aggregate([
            { $group: { _id: null, categories: { $addToSet: "$category" } } },
            { $project: { _id: 0, categories: 1 } }
        ]);
        const product = await Product.findById(req.params.id);
        res.status(200).json({categories:categories[0].categories,product});
    } catch (e) {
        res.status(400).json("can't get categories.")
    }
})

module.exports = router;