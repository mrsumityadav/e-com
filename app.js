require('dotenv').config();
const cors = require('cors')
const express = require('express');
const app = express();
app.use(cors())
const connectDB = require('./config/mongodb');
connectDB();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const indexRouter = require('./routes/index.routes')
const userRouter = require('./routes/user.routes')
const productRouter = require('./routes/product.routes')

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/product', productRouter)

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})