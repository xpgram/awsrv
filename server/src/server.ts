import * as Express from "express";
import SocketIO from "socket.io";

const PORT = process.env.PORT || 3001;

const app = Express();
app.set("port", PORT);

const http = require('http').Server(app);   // TODO Make this an import
const io = require('socket.io') (http);     // TODO Make this an import

// simple '/' endpoint sending a Hello World response
// app.get("/", (req: any, res: any) => {
//   res.send("hello world");
// });

// acknowledge user connections
io.on("connection", socket => {
  console.log(`connected ${socket.id}`);

  io.on("disconnect", reason => {
    console.log(`disconnected ${socket.id} : ${reason}`);
  })
})

// start our simple server up on localhost:3000
const server = http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});