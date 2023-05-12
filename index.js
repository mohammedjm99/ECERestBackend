const express = require("express");
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3002;
const http = require('http');
const server = http.createServer(app);

const cors = require("cors");
const allowedOrigins = [
  'https://ecerest.onrender.com',
  'https://ecerest2.onrender.com'
];
// const allowedOrigins = [
//   'http://172.20.10.5:3000',
//   'http://172.20.10.5:3001'
// ];
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

  socket.on("joinChef", userId => {
    addUser(userId, socket.id, "chef");
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
  });

  socket.on("removeOrder", ({id,table}) => {
    for (const user of users) {
      if (user.userId === table || user.rule==='admin' || user.rule==='cashier') {
        socket.to(user.socketId).emit("removeOrder", {id,table});
      }
    }
  })

  socket.on("changeStatus", data => {
    for (const user of users) {
      if (user.rule === 'cashier' || user.rule === 'admin' || user.userId === data.table._id) socket.to(user.socketId).emit('changeStatus', data);
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