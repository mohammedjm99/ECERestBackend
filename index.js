const express = require("express");
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3002;
const cors = require("cors");
const mongoose = require('mongoose');

const allowedOrigins = [
  'https://ecerest.onrender.com',
  'https://ecerest2.onrender.com'
]

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

const tableRouter = require('./routes/table');
const authRouter = require('./routes/auth');
const orderRouter = require('./routes/order');
const managerRouter = require('./routes/manager');
const productRouter = require('./routes/product');

app.use('/api/table', tableRouter);
app.use('/api/auth', authRouter);
app.use('/api/order', orderRouter);
app.use('/api/manager', managerRouter);
app.use('/api/product', productRouter);

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log("SERVER RUNNING ON PORT", PORT, "AND DB CONNECTED...");
  });
})