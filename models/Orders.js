const mongoose = require('mongoose')
mongoose.set('debug', true);

const OrderSchema = new mongoose.Schema({
    name: String,
    path: String,
    price: Number,
    desc: String,
    size: String,
    color: String,
    quantity: Number,
    userAdded: String,
    userEmail: String
})


const OrderModel = mongoose.model("orders", OrderSchema, "orders")
module.exports = OrderModel