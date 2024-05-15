const mongoose = require('mongoose');

const Cart = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        productid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        },
        quantity: {
            type: Number,
            default: 1
        },
        deliveryTime: {
            type: Number,
        },
        deliveryCharge: {
            type: Number,
        },
        image: {
            type: String
        },
        title: {
            type: String
        },
        price: {
            type: Number
        },
        size:{
            type:String,
            default:"medium"
        }
    }],
    TotalData: {
        total: { type: Number }, servicefee: { type: Number }, subtotal: { type: Number }
    }
}, { timestamps: true });

const CartModel = mongoose.model("Cart", Cart);

module.exports = CartModel;
