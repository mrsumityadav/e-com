const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    orderId: {
        type: String,
        required: true,
    },
    paymentId: {
        type: String,
        default: null,
    },
    signature: {
        type: String,
        default: null,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'success', 'failed'],
    }
}, { timestamps: true });

const Payment = mongoose.model('payment', paymentSchema);
module.exports = Payment;