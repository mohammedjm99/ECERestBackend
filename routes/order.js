const router = require('express').Router();
const InProgressOrder = require('../models/InProgressOrder');
const PaidOrder = require('../models/PaidOrders');
const Product = require('../models/Product');
const Table = require('../models/Table');
const { verifyTokenAndAuthorization, verifyTokenAndChief, verifyTokenAndAdmin,verifyTokenAndCashier } = require('../controllers/verify');

const { getWeeks } = require('../controllers/functions');

router.post('/:id', verifyTokenAndAuthorization ,async (req, res) => {
    const { products } = req.body;
    let orderedProducts = [];
    try {
        for (const product of products) {
            if (product.quantity < 1 || product.quantity > 10) {
                return res.status(400).json("developer tools are not used for hacking.");
            }
            const foundProduct = await Product.findById(product.product).select('name price -_id');
            if (!foundProduct) return res.status(400).json("Item to be ordered is not found.");
            orderedProducts.push({ ...foundProduct._doc, quantity: product.quantity });
        }
        const table = await Table.findById(req.params.id).select('number');

        const newOrder = new InProgressOrder({
            products: orderedProducts,
            table
        })
        await newOrder.save();
        res.status(200).json(newOrder);
    } catch (e) {
        res.status(400).json("Unable to order...");
    }
});

router.get('/user/:id', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const orders = await InProgressOrder.find({ 'table._id': req.params.id, status: { $lt: 4 } })
        res.json(orders);
    } catch (e) {
        res.status(400).send("Can't get order.");
    }
});

router.get('/chief', verifyTokenAndChief, async (req, res) => {
    try {
        const orders = await InProgressOrder.find({ status: { $lt: 2 } });
        const tables = await Table.find({ number: { $ne: 0 } });
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
        }, { new: true });
        if (!updatedOrder) return res.status(400).json("No order found to update.");
        res.status(200).json(updatedOrder);
    } catch (e) {
        res.status(400).json("error.");
    }
});

router.put('/admin/inprogress/:id', verifyTokenAndCashier, async (req, res) => {
    try {
        const order = await InProgressOrder.findOne({ _id: req.params.id });
        await InProgressOrder.deleteOne({ _id: req.params.id });
        if (order.status === 2) {
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

router.get('/admin/paid/:date',verifyTokenAndAdmin, async (req, res) => {
    const { date } = req.params;
    try {
        const today = new Date(date);
        today.setUTCHours(today.getUTCHours() + 3);

        const start = new Date(today);
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(today);
        end.setUTCHours(23, 59, 59, 999);
        const paidOrders = await PaidOrder.find({
            createdAt: {
                $gte: start,
                $lte: end
            },
        })
        res.status(200).json(paidOrders);
    } catch (e) {
        res.status(400).json("error.");
    }
});

router.get('/inprogress', verifyTokenAndCashier, async (req, res) => {
    try {
        let total = 0;
        const tables = await Table.find().select("number");
        const orders = await InProgressOrder.find({ status: { $lt: 4 } }).select("table");
        const arr = tables.reduce((acc, table) => {
            acc[table._id] = { number: table.number, amount: 0 };
            return acc;
        }, {});
        orders.forEach(order => {
            arr[order.table._id].amount += 1;
            total += 1;
        });
        res.status(200).json({ arr, total,rule:req.user.rule });
    } catch (e) {
        res.status(400).json('error.');
    }
});

router.get('/inprogress/:id', verifyTokenAndCashier, async (req, res) => {
    try {
        const table = await Table.findById(req.params.id).select('number');
        const orders = await InProgressOrder.find({ 'table._id': req.params.id, status: { $lt: 4 } })
        let canEdit = false;
        if(req.user.rule==='cashier') canEdit=true;
        res.status(200).json({ orders, tableNumber: table.number,canEdit });
    } catch (e) {
        res.status(400).json('error.');
    }
});

router.get('/createorders', verifyTokenAndCashier, async (req, res) => {
    try {
        const products = await Product.find();
        const categories = await Product.aggregate([
            { $group: { _id: null, categories: { $addToSet: "$category" } } },
            { $project: { _id: 0, categories: 1 } }
        ]);
        const tables = await Table.find().select('number');
        res.status(200).json({ products, categories: categories[0].categories, tables,rule:req.user.rule });
    } catch (e) {
        res.status(400).json('error.');
    }
});

router.get('/dashboard', verifyTokenAndAdmin,async (req, res) => {
    try {
        const countTables = await Table.countDocuments({ number: { $ne: 0 } });

        const today = new Date();
        today.setUTCHours(today.getUTCHours() + 3);

        const start = new Date(today);
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(today);
        end.setUTCHours(23, 59, 59, 999);

        const todayOrders = await PaidOrder.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: start,
                        $lte: end
                    },
                    "products.price": { $exists: true, $type: "number" },
                    "products.quantity": { $exists: true, $type: "number" },
                    $expr: { $ne: [{ $size: "$products" }, 0] }
                }
            },
            {
                $group: {
                    _id: null,
                    numOrders: { $sum: 1 },
                    totalPrice: {
                        $sum: {
                            $reduce: {
                                input: "$products",
                                initialValue: 0,
                                in: { $add: ["$$value", { $multiply: ["$$this.price", "$$this.quantity"] }] }
                            }
                        }
                    }
                }
            }
        ]);

        const countProducts = await Product.countDocuments();

        const weeks = getWeeks('saturday', 5);
        const total = [];

        for (let i = 0; i < weeks.length; i++) {
            const { start, end } = weeks[i];
            const result = await PaidOrder.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: start,
                            $lte: end,
                        },
                    },
                },
                {
                    $unwind: "$products",
                },
                {
                    $addFields: {
                        totalPrice: { $multiply: ["$products.price", "$products.quantity"] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalPrice: { $sum: "$totalPrice" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        totalPrice: 1,
                    },
                },
            ]);
            total[i] = result[0]?.totalPrice || 0;
        }

        res.status(200).json({ countTables, countProducts, todayOrders: { count: todayOrders[0]?.numOrders || 0, totalPrice: todayOrders[0]?.totalPrice || 0 }, total })
    } catch (e) {
        res.status(400).json("can't get");
        console.log(e);
    }
})


module.exports = router;

