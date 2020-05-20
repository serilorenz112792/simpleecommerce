const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    productName: String,
    price: Number,
    category: String,
    quantity: Number,
    imgPath: String
}, { timestamps: true })

module.exports = Product = mongoose.model('product', productSchema)