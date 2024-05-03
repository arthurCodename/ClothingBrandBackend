const mongoose = require('mongoose')
mongoose.set('debug', true);

const CartSchema = new mongoose.Schema({
    name: String,
    path: String,
    price: Number,
    desc: String,
    bigDesc: String,
    size: String,
    color: String,
    quantity: Number,
    userAdded: String,
    userEmail: String
})


const CartModel = mongoose.model("carts", CartSchema, "carts")
module.exports = CartModel