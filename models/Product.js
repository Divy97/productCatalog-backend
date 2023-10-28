const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    productDescription: {
        type: String,
        required: true,
    },
    image: {
        type: String, // You can store image URLs or file paths as strings
        required: true,
    },
    productCategory: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    sellerName: {
        type: String,
        required: true,
    },
    sellerPhoneNumber: {
        type: String,
        required: true,
    },
    sellerAddress: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        required: false,
    },
});

module.exports = mongoose.model('Product', productSchema);
