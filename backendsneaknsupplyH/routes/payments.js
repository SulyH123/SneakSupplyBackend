const express = require('express');
const router = express.Router();
const asyncerror = require('../middlewares/catchasyncerror');
const ErrorHandler = require('../middlewares/errorhandler');
const User = require('../model/user.js');
const { verifyToken } = require('../middlewares/verifyauth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const CartModel = require('../model/Cart.js');
const SessionModal = require('../model/Sessions.js');


function generateReceiptNumber(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let receiptNumber = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        receiptNumber += characters.charAt(randomIndex);
    }

    return receiptNumber;
}


// Create Checkout Session
router.post('/createcheckoutsession', verifyToken, asyncerror(async (req, res, next) => {
    const user = await User.findById(req._id);
    const DeliveryAddress=req.body.DeliveryAddress;
    let cart = await CartModel.findOne({ user: user._id }).lean();
    const line_items = [];
    let currency = "gbp";
    cart.products.forEach(element => {
        let basePrice = element.price;
        // Calculate total shipping charges
        let totalShippingCharges = 0;
        totalShippingCharges = element.deliveryCharge || 0; // Delivery charge for the first item
        if (element.quantity > 1) {
            // Add additional charges for each extra item
            totalShippingCharges += (element.quantity - 1) * (element.deliveryCharge || 0);
        }
        // Total price for all units including their respective shipping charges
        let totalPrice = (basePrice * element.quantity) + totalShippingCharges;
        var currentObj = {
            price_data: {
                currency: currency,
                product_data: {
                    name: element.title
                },
                unit_amount: Math.round(totalPrice * 100 / element.quantity) // Unit price in cents, averaged over quantity
            },
            quantity: element.quantity
        };
        line_items.push(currentObj)
    });

    let sessionProducts = cart.products;
    const ProductPrices = cart.products.map(product => {
        // Base price calculation
        let basePrice = product.price * product.quantity;
        // Calculate shipping charges
        let shippingCharges = 0
        shippingCharges = Number(((product.deliveryCharge || 0) * product.quantity))
        // Total price for the product including shipping and additional charges
        let totalofdata = Math.round((basePrice + shippingCharges) * 100) / 100;
        return totalofdata;
    });
    const totalAmountProducts = ProductPrices.reduce((acc, price) => acc + parseFloat(price), 0);
    const session = new SessionModal({ user: user._id, products: sessionProducts, currency,DeliveryAddress:DeliveryAddress });
    const customReceiptNumber = generateReceiptNumber();
    session.receiptNumber = customReceiptNumber;
    session.totalAmount = totalAmountProducts;
    if (session.totalAmount.toFixed(0) !== cart.TotalData.total.toFixed(0)) {
        return next(new ErrorHandler("Some of your Cart Data of Courses has been Modified. Please review the changes before checkout", 207));
    }
    const stripesession = await stripe.checkout.sessions.create({
        success_url: `${process.env.HOST}/Thankyou/${session._id}`, // URL to redirect after successful payment
        cancel_url: `${process.env.HOST}/account/cart`, // URL to redirect after cancelled payment
        mode: 'payment',
        payment_method_types: ['card', 'bacs_debit'],
        line_items,
        allow_promotion_codes: true,
        metadata: {
            custom_receipt_number: customReceiptNumber, // Use your own logic to generate a custom receipt number
        }
    });
    session.stripesessionid = stripesession.id;
    await session.save();
    res.status(200).send({ success: true, session: stripesession.url })
}));


router.get('/session/:id', asyncerror(async (req, res, next) => {
    const sessions = await SessionModal.findById(req.params.id).select('-user  -stripesessionid');
    res.status(200).json({ success: true, data: sessions })
}));
module.exports = router;