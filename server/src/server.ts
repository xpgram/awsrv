import * as Express from "express";
import { Server } from "socket.io";

const PORT = Number(process.env.PORT || 3001);

const app = Express();
app.set("port", PORT);

const http = require('http').Server(app);   // TODO Make this an import
const io = new Server(http);

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

// io.listen(PORT);

// TODO Game.online is configured to initialize a socket.io object which.. *should* be connecting
// to localhost:3001, so I'm just trying to connect the two instances.
// The game runs on webpack-dev-server, so I may need to proxy a request or something.

// start our simple server up on localhost:3000
const server = http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});