const express = require('express');
const app = express();
require('dotenv').config()
const connecttomongo = require('./db');
const cors = require('cors')
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const errorMiddleware = require('./middlewares/error.js');
const SessionModal = require('./model/Sessions.js');
const CartModel = require('./model/Cart.js');
const endpointSecret = process.env.STRIPE_WEBHOOK;
const OrderModal=require('./model/Order.js');
const Product = require('./model/Item.js');
const { futureTimeInEST, addBusinessDaysEST } = require('./util/helper.js');

app.use(cors());
connecttomongo();

// Stripe Webhook here
app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
    const sig = request.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
        console.log(err)
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    const handleCheckoutSuccess = async (stripesession) => {
        console.log("handling success", stripesession)
        const session = await SessionModal.findOne({ stripesessionid: stripesession.id })

        if (!session) {
            console.log("No session found");
            return
        };
        if (session.status === "succeeded") return;
        session.status = stripesession.status;
        for (const product of session.products) {
            let productdata=await Product.findById(product.productid);
            let DeliveryDate = addBusinessDaysEST(product.deliveryTime);
            await OrderModal.create({ product, user: session.user,DeliveryDate,DeliveryAddress:session.DeliveryAddress });
            await productdata.save();
        };
        session.save();
        const cart = await CartModel.findOne({ user: session.user });
        cart.products = [];
        await cart.save()
        console.log("done")
    }

    const handleCheckoutFail = async (stripesession) => {
        const session = await SessionModal.findOne({ stripesessionid: stripesession.id })
        if (!session) {
            console.log("No session found");
            return
        }
        if (session.status === "succeeded") return
        session.status = stripesession.status
        await session.save()
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            handleCheckoutSuccess(event.data.object)
            break;
        case 'checkout.session.async_payment_succeeded':
            handleCheckoutSuccess(event.data.object)
            break;
        case 'checkout.session.async_payment_failed':
            handleCheckoutFail(event.data.object)
            break;
        default:
            console.log(event.type)
    }
    // Return a 200 response to acknowledge receipt of the event
    response.send();
});
// app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
// app.use(upload.array()); 
app.use(express.json({ limit: '50mb' }));

app.use('/api/admin', require('./routes/admin.js'));
app.use('/api/user', require('./routes/user.js'));
app.use('/api/payments', require('./routes/payments.js'));
app.use('/api/cart', require('./routes/cart.js'));
app.use('/api/order', require('./routes/order.js'));

app.use(errorMiddleware)



module.exports = app;