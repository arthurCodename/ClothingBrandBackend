const mongoose = require('mongoose')

const ProductsSchema = new mongoose.Schema({
    name: String,
    path: String,
    price: Number,
    desc: String,
    bigDesc: String,
    category: String
})


const ProductsModel = mongoose.model("products", ProductsSchema)
module.exports = ProductsModel