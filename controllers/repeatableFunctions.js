const Order = require('../models/Order');
const Product = require('../models/Product');

const getOrders = async(m, s, id = null) => {
    let query = {};
    if(id) query['tableId'] = id;
    if(m==='lt') query['status'] = {$lt:s};
    else if(m==='gt') query['status'] = {$gt:s};
    else query['status'] = s;
    const orders = await Order.find(query);
    const orderItems = [];
    for (const order of orders) {
        const items = await Promise.all(order.items.map(async item => {
            const product = await Product.findOne({ _id: item.itemId });
            const fullItem = {
                ...item._doc,
                name: product.name,
                category: product.category,
                img: product.img,
                price: product.price
            };
            return fullItem;
        }));
        orderItems.push({ ...order._doc, items });
    }
    return orderItems;
}

module.exports = {
    getOrders
};