const mongoose = require('mongoose');

const connectDB = () => {
    try {
        mongoose.connect(process.env.MONGODB_URI).then(function(){
            console.log('Connected to MongoDB');
        }).catch(function(error){
            console.log('Error connecting to MongoDB', error);
        });
    } catch (error) {
        console.log('Error connecting to MongoDB', error);
    }
}

module.exports = connectDB;