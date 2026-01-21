const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    product:{
        type: Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    buyer:{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    payment:{
        type: Schema.Types.ObjectId,
        ref: 'payment',
        required: true
    }
},{timestamps: true});

const Order = mongoose.model('order', orderSchema);
module.exports = Order;