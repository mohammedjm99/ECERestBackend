const router = require('express').Router();
const InProgressOrder = require('../models/InProgressOrder');
const PaidOrder = require('../models/PaidOrders');
const Product = require('../models/Product');
const Table = require('../models/Table');
const { verifyTokenAndAuthorization, verifyTokenAndChief, verifyTokenAndAdmin } = require('../controllers/verify');

router.post('/:id', verifyTokenAndAuthorization, async (req, res) => {
    const { products } = req.body;
    try {
        for (const product of products) {
            const foundProduct = await Product.findById(product.product);
            if (!foundProduct) return res.status(400).json("Item to be ordered is not found.");
        }
        const newOrder = new InProgressOrder({
            table: req.params.id,
            products,
        })
        await newOrder.save();
        const populatedOrder = await newOrder.populate([{
            path: 'products.product',
            select: 'name',
        }, {
            path: 'table',
            select: 'number',
        }]);
        res.status(200).json(populatedOrder);
    } catch (e) {
        res.status(400).json("Unable to order...");
    }
});

router.get('/user/:id', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const orders = await InProgressOrder.find({ table: req.params.id, status: { $lt: 4 } })
            .populate({
                path: 'products.product',
                select: 'name price',
            });
        res.json(orders);
    } catch (e) {
        res.status(400).send("Can't get order.");
    }
});

router.get('/chief', verifyTokenAndChief, async (req, res) => {
    try {
        const orders = await InProgressOrder.find({ status: { $lt: 2} })
            .populate([{
                path: 'products.product',
                select: 'name',
            }, {
                path: 'table',
                select: 'number',
            }]);
        const tables = await Table.find();
        res.status(200).json({ orders, tables });
    } catch (e) {
        res.status(400).send("Can't get order.");
    }
});

router.put('/chief', verifyTokenAndChief, async (req, res) => {
    const { id, status, msg } = req.body;
    try {
        const updatedOrder = await InProgressOrder.findByIdAndUpdate(id, {
            $set: {
                status,
                msg
            }
        });
        if (!updatedOrder) return res.status(400).json("No order found to update.");
        res.status(200).json();
    } catch (e) {
        res.status(400).json("error.");
    }
});

router.post('/admin/inprogress/:id', async (req, res) => {
    try {
        const order = await InProgressOrder.findOne({_id:req.params.id});
        await InProgressOrder.deleteOne({_id:req.params.id});
        if(order.status===2){
            const newPaidOrder = new PaidOrder({
                table: order.table,
                products: order.products
            });
            await newPaidOrder.save();
        }
        res.status(200).json();
    } catch (e) {
        res.status(400).json("error.");
    }
});

router.get('/admin/paid/:date', async (req, res) => {
    const {date} = req.params;
    try {
        const paidOrders = await PaidOrder
            .find({createdAt: { $gte: new Date(date), $lt: new Date(date).setDate(new Date(date).getDate() + 1) }})
            .populate([{
                path: 'products.product',
                select: 'name price',
            }, {
                path: 'table',
                select: 'number',
            }]).sort({createdAt:-1});
        res.status(200).json(paidOrders);
    } catch (e) {
        res.status(400).json("error.");
    }
});

router.get('/test',async(req,res)=>{
    try{
        const order = await PaidOrder.findByIdAndDelete("642718005c142c889337e2a6");
        res.status(400).json(order)
    }catch(e){
        res.status(400).json('error.')
    }
    await PaidOrder.findByIdAndDelete("PaidOrder")
})

router.get('/inprogress',async(req,res)=>{
    try{
        let total=0;
        const tables = await Table.find().select("number");
        const orders = await InProgressOrder.find({status:{$lt:4}}).select("table");
        const arr = tables.reduce((acc, table) => {
            acc[table._id] = {number:table.number,amount:0};
            return acc;
        }, {});
        orders.forEach(order=>{
            arr[order.table].amount+=1;
            total+=1;
        })
        res.status(200).json({arr,total});
    }catch(e){
        res.status(400).json('error.');
    }
});

router.get('/inprogress/:id', async(req,res)=>{
    try{
        const table = await Table.findById(req.params.id).select('number');
        const orders = await InProgressOrder.find({table:req.params.id,status:{$lt:4}})
            .populate({
                path: 'products.product',
                select: 'name price',
            });
        res.status(200).json({orders,tableNumber:table.number});
    }catch(e){
        res.status(400).json('error.');
    }
})

module.exports = router;

