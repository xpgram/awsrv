import { Server } from "socket.io";

const PORT = Number(process.env.PORT || 3001);

// TODO Uninstall Express, unless I want it for something else.


const io = new Server(PORT);
console.log(`listening on *:${PORT}`);  // TODO Only on successful io construction


// TODO Remove; this was to differentiate clients during game-multiplayer testing
let clients_connected = -1;

// Handle user connections
io.on("connection", async socket => {
  console.log(`connected ${socket.id}`);

  clients_connected++;

  // Inform the client which player number they are.
  // TODO Do this by matching a user auth to a user in the Db; Do this on 'game join', not 'connetion'.
  io.to(socket.id).emit('game session data', clients_connected);

  // socket.join(`game_${gameId}`);  // This will be useful later, when GameId becomes the name of a room.
  // Every socket, by default, is a member of its own room. This is how DMs can work.
  // But other room strings can also be used. So, an ID string prepended with 'game_' will be
  // a place that players of some game session can talk to each other.


  // TODO Signal relay between clients. Is there a more compact way to do this?
  // I want something like:
  //  broadcastEvents = ['troop order', 'turn change'];
  //  socket.on( (ev, data) => {
  //    if (broadcastEvents.includes(ev))
  //      socket.broadcast.emit(ev, data);
  //  })
  socket.on("troop order", data => {
    console.log(`game: instruction ${JSON.stringify(data)}`);
    socket.broadcast.emit("troop order", data); // This sends the message to everyone but self, correct?
  })
  socket.on("turn change", () => {
    console.log(`game: turn change`);
    socket.broadcast.emit("turn change", undefined);
  })

  socket.on("disconnect", reason => {
    console.log(`disconnected ${socket.id} : ${reason}`);
    clients_connected--;
  })

  // Server symboles '↪ ↛ ⤮ ⥇'
  // Db symbols '⛁⛃'

  // Test indicating that awdb is functional
  // TODO async GET request to awdb
  // const game_sessions = await fetch('http://localhost:3002/api/g/');
    // TODO I just realized this project isn't proxied. Hm.
  // io.to(socket.id).emit('db test', game_sessions);

})
