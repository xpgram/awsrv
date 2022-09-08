import { Server } from "socket.io";

const PORT = Number(process.env.PORT || 3001);

// TODO Uninstall Express, unless I want it for something else.


const io = new Server(PORT);
console.log(`listening on *:${PORT}`);  // TODO Only on successful io construction


// TODO Remove; this was to differentiate clients during game-multiplayer testing
let clients_connected = 0;

// Handle user connections
io.on("connection", socket => {
  console.log(`connected ${socket.id}`);

  clients_connected++;

  // Inform the client which player number they are.
  // TODO Do this by matching a user auth to a user in the Db; Do this on 'game join', not 'connetion'.
  io.to(socket.id).emit('game session data', clients_connected);

  // socket.join(`game_${gameId}`);  // This will be useful later, when GameId becomes the name of a room.
  // Every socket, by default, is a member of its own room. This is how DMs can work.
  // But other room strings can also be used. So, an ID string prepended with 'game_' will be
  // a place that players of some game session can talk to each other.

  socket.on("troop order", data => {
    socket.broadcast.emit("troop order", data); // This sends the message to everyone but self, correct?
  })

  socket.on("disconnect", reason => {
    console.log(`disconnected ${socket.id} : ${reason}`);
    clients_connected--;
  })

})
