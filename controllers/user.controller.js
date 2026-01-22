const userModel = require('../models/user.model');
const productModel = require('../models/product.model')
const paymentModel = require('../models/payment.model')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const blockListedModel = require('../models/blacklist.model')

const Razorpay = require('razorpay');

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports.signup = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json(
                { message: 'All fields are required' }
            )
        }

        let isUserExist = await userModel.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({
                message: 'User already exists'
            })
        }

        let hashedPassword = await bcrypt.hash(password, 10);
        let user = await userModel.create({
            username,
            email,
            password: hashedPassword,
            role
        })

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            message: 'User created successfully',
            user,
            token
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

module.exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: 'All fields are required'
            })
        }

        let user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'Invalid email or password'
            })
        }
        let isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: 'Invalid email or password'
            })
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            message: 'User signed in successfully',
            user,
            token
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

module.exports.logout = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        if (!token) {
            return res.status(400).json({
                message: 'Token is required'
            })
        }
        const isTokenBlockListed = await blockListedModel.findOne({ token })

        if (isTokenBlockListed) {
            return res.status(400).json({
                message: "Token already blocklisted"
            })
        }

        await blockListedModel.create({ token })
    } catch (err) {
        next(err)
    }
}

module.exports.getProfile = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id)
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }
        res.status(200).json({
            message: "User fetch successfully",
            user
        })

    } catch (error) {
        next(error)
    }
}

module.exports.getProducts = async (req, res, next) => {
    try {
        const products = await productModel.find({})
        res.status(200).json({
            products
        })
    } catch (error) {
        next(error)
    }
}

module.exports.getProductById = async (req, res, next) => {
    try {
        const product = await productModel.findById(req.params.id)
        res.status(200).json({
            product
        })
    } catch (error) {

    }
}

module.exports.createOrder = async (req, res, next) => {
    try {
        const product = await productModel.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const option = {
            amount: product.price * 100,
            currency: "INR",
            receipt: product._id
        }
        const order = await instance.orders.create(option)
        res.status(200).json({
            order
        })
        const payment = await paymentModel.create({
            orderId: order._id,
            amount: product.price,
            currency: "INR",
            status: "pending"
        })
    } catch (error) {
        next(error)
    }
}

module.exports.verifyPayment = async (req, res, next) => {
    try {
        const { orderId, paymentId, signature } = req.body
        const secret = process.env.RAZORPAY_KEY_SECRET
        const { validatePaymentVerification } = require('../node_modules/razorpay/dist/utils/razorpay-utils.js')
        const isValid = validatePaymentVerification({
            order_id: orderId,
            payment_id: paymentId,
        }, secret, signature)
        if (isValid) {
            const payment = await paymentModel.findOne({ orderId: orderId })
            if (!payment) {
                return res.status(404).json({ message: "Payment record not found" });
            }
            payment.paymentId = paymentId;
            payment.signature = signature
            payment.status = "success"

            await payment.save()

            res.status(200).json({
                message: "Payment verified successfully"
            })
        }
        else {
            const payment = await paymentModel.findOne({ orderId: orderId })
            if (!payment) {
                return res.status(404).json({ message: "Payment record not found" });
            }
            payment.status = 'failed'
            await payment.save()
            res.status(400).json({
                message: "Payment verification failed"
            })
        }
    } catch (error) {
        next(error)
    }
}