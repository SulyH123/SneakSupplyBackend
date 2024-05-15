const express = require('express');
const router = express.Router();
const asyncerror = require('../middlewares/catchasyncerror');
const ErrorHandler = require('../middlewares/errorhandler');
const { verifyToken } = require('../middlewares/verifyauth');
const CartModel = require('../model/Cart.js');
const ProductModel = require('../model/Item.js');
// Cart
router.post('/', verifyToken, asyncerror(async (req, res, next) => {
    const ItemId = req.body.id;
    const quantity = req.body.quantity;
    const size = req.body.size;
    const user = req._id;
    let cart = await CartModel.findOne({ user });
    let Item;

    let product = await ProductModel.findById(ItemId).lean();

    if (!product) {
        return next(new ErrorHandler("Invalid Product", 405));
    };

    if (product?.quantity < quantity) {
        return next(new ErrorHandler("This Product Doesn't Have Enough Stock!", 405));
    };

    Item = {
        productid: product._id,
        price: (product.price).toFixed(2),
        quantity,
        image: product.image,
        title: product.title,
        size,
        deliveryTime:product.deliveryTime
    };
    if (!cart) {
        cart = await CartModel.create({ user, products: [Item] })
    } else {
        const SameProduct = cart.products.find((elem) => elem.productid.toString() == product._id);
        if (SameProduct) {
            if (product.quantity < SameProduct.quantity + quantity) {
                return next(new ErrorHandler("This Product Doesn't Have Enough Stock!", 405));
            }
            SameProduct.quantity += quantity
        } else {
            cart.products.push(Item);
        }
    }
    console.log(cart)
    const TotalData = await GetTotalOfCart(cart.products);
    cart.TotalData = TotalData
    await cart.save()
    res.status(200).send({ success: true });
}));


// 
router.get('/', verifyToken, asyncerror(async (req, res, next) => {
    let user = req._id;
    let cart = await CartModel.findOne({ user });
    if(!cart){
        cart = await CartModel.create({ user, products: [] })
    }
    const TotalData = await GetTotalOfCart( cart?.products);
    cart.TotalData = TotalData;
    await cart.save();
    res.status(200).send({ success: true, data: cart });
}));

// Get total
async function GetTotalOfCart(products) {
    // Get total
    let subtotal = 0;

    products?.forEach(elem => {
        // Base price calculation
        let basePrice = Math.round(elem.price * elem.quantity * 100) / 100;
        // Calculate shipping charges
        let shippingCharges = 0
        shippingCharges = Number(((elem.deliveryCharge || 0) * elem.quantity));
        // Total price for the product including shipping and additional charges
        var total = basePrice + shippingCharges
        subtotal += total;
    });
    // Calculate service fee as 0% of the subtotal
    let servicefee = subtotal * 0.00;

    // Calculate total as the sum of subtotal and service fee
    let total = subtotal + servicefee;

    // Round to 2 decimal places
    subtotal = Number(subtotal.toFixed(2));
    servicefee = Number(servicefee.toFixed(2));
    total = Number(total.toFixed(2));
    return { total, servicefee, subtotal }
};
// 
router.delete('/:id', verifyToken, asyncerror(async (req, res, next) => {
    const user = req._id;
    const itemId = req.params.id;
    const type = req.query.type;

    let cart = await CartModel.findOne({ user })

    if (!cart) {
        return next(new ErrorHandler("You don't have any product in your cart yet", 404));
    }

    // Check if the course to be removed exists in the cart
    if (type === "product") {
        const productIndex = cart.products.findIndex((elem) => elem._id.toString() == itemId);
        if (productIndex === -1) {
            return next(new ErrorHandler("Product not found in the cart", 404));
        } else {
            cart.products.splice(productIndex, 1);
        }
    }
    // Save the updated cart
    const TotalData = await GetTotalOfCart(cart?.products);
    cart.TotalData = TotalData;
    await cart.save();
    res.status(200).send({ success: true, data: cart, TotalData });
}));



module.exports = router;