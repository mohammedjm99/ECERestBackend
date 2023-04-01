const express = require("express");
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3002;
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

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
const mongoose = require('mongoose');

const tableRouter = require('./routes/table');
const authRouter = require('./routes/auth');
const orderRouter = require('./routes/order');
const managerRouter = require('./routes/manager');
const productRouter = require('./routes/product');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://ecerest.onrender.com", "https://ecerest2.onrender.com"],
    methods: ["GET", "POST"],
  },
});

let users = [];

const addUser = (userId, socketId, rule) => {
  users.push({ rule, userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {

  socket.on("joinUserO", userId => {
    addUser(userId, socket.id, "user");
    console.log(users);
  });

  socket.on("joinChief", userId => {
    addUser(userId, socket.id, "chief");
    console.log(users);
  });

  socket.on("joinAdmin", userId => {
    addUser(userId, socket.id, "admin");
    console.log(users);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log(users);
  });

  socket.on("addOrder", data => {
    for (const user of users) {
      if (user.rule !== 'user') socket.to(user.socketId).emit("addOrder", data)
    }
    console.log(users);
  })


});

app.use('/api/table', tableRouter);
app.use('/api/auth', authRouter);
app.use('/api/order', orderRouter);
app.use('/api/manager', managerRouter);
app.use('/api/product', productRouter);

mongoose.connect("mongodb+srv://ECERest:mo2468097531@mern1.ahendlt.mongodb.net/?retryWrites=true&w=majority").then(() => {
  server.listen(PORT, () => {
    console.log("SERVER RUNNING ON PORT", PORT, "AND DB CONNECTED...");
  });
})