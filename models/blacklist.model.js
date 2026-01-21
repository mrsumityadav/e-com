const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blacklistSchema = new Schema({
    token:{
        type: String,
        required: true,
    }
},{timestamps: true});

blacklistSchema.index({token:1}, {unique:true})

const Blacklist = mongoose.model('blacklist', blacklistSchema);
module.exports = Blacklist;