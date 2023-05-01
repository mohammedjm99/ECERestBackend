const express = require("express");
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3002;
const http = require('http');
const server = http.createServer(app);

const cors = require("cors");
const allowedOrigins = [
  'https://ecerest.onrender.com',
  'https://ecerest.onrender.com2'
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
const mongoose = require('mongoose');

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


const io = require('socket.io')(server, {
  cors: {
    origin: allowedOrigins,
  },
});

let users = [];

const addUser = (userId, socketId, rule) => {
  users.push({ rule, userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

// const getUser = (userId) => {
//   return users.find((user) => user.userId === userId);
// };

io.on("connection", (socket) => {

  socket.on("joinUserO", userId => {
    addUser(userId, socket.id, "user");
  });

  socket.on("joinChief", userId => {
    addUser(userId, socket.id, "chief");
  });

  socket.on("joinCashier", userId => {
    addUser(userId, socket.id, "cashier");
  });

  socket.on("joinAdmin", userId => {
    addUser(userId, socket.id, "admin");
  });


  socket.on("addOrder", data => {
    for (const user of users) {
      if (user.rule !== 'user') {
        socket.to(user.socketId).emit("addOrder", data);
      }
    }
  })

  socket.on("changeStatus", data => {
    for (const user of users) {
      if (user.rule === 'cashier' || user.rule === 'admin' || user.userId===data.table._id) socket.to(user.socketId).emit('changeStatus', data);
    }
  })

  socket.on("disconnect", () => {
    removeUser(socket.id);

  });
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  server.listen(PORT, () => {
    console.log("SERVER RUNNING ON PORT", PORT, "AND DB CONNECTED...");
  });
})