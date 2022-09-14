import { Server } from "socket.io";

const PORT = Number(process.env.PORT || 3001);

// TODO Uninstall Express, unless I want it for something else.


const io = new Server(PORT);
console.log(`listening on *:${PORT}`);  // TODO Only on successful io construction


// Record information about server performance.
module metrics {
  export let total_clients: number = 0;
  export let total_messages: number = 0;
  export let messages_this_activity_block: number = 0;
  
  export module timestamps {
    /** The time this server started operating. */
    export const start_server: number = Date.now();
    /** The time used to measure messages per second. */
    export let start_activity_block: number = start_server;
  }
}

function addMessageCount() {
  metrics.total_messages++;
  metrics.messages_this_activity_block++;
}

// Periodically update the server log with performance measurements.
const MILLIS = 1000;
const UPDATE_INTERVAL = 10000;
setInterval(() => {
  const now = Date.now();
  const activityBlockTime = (now - metrics.timestamps.start_activity_block) / MILLIS;
  const msgCount = metrics.messages_this_activity_block;
  const msgPerSecond = msgCount / activityBlockTime;

  // metrics.timestamps.start_activity_block = now - UPDATE_INTERVAL/2;
    // TODO I need to know which messages to cull to keep the count accurate
  metrics.timestamps.start_activity_block = now;
  metrics.messages_this_activity_block = 0;

  console.log(`[SERVER] Served ${msgCount} messages (${msgPerSecond.toFixed(2)}ms/s) between ${metrics.total_clients} sockets.`);
}, UPDATE_INTERVAL);


// Handle user connections
io.on("connect", async socket => {
  console.log(`connected ${socket.id}`);
  
  // Update server metrics info
  metrics.total_clients++;
  socket.onAny(addMessageCount);
  socket.onAnyOutgoing(addMessageCount);

  // Inform the client which player number they are.
  // TODO Do this by matching a user auth to a user in the Db; Do this on 'game join', not 'connetion'.
  io.to(socket.id).emit('game session data', metrics.total_clients - 1);

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
    metrics.total_clients--;
  })

  // Server symboles '↪ ↛ ⤮ ⥇'
  // Db symbols '⛁⛃'

  // Test indicating that awdb is functional
  // TODO async GET request to awdb
  // const game_sessions = await fetch('http://localhost:3002/api/g/');
    // TODO I just realized this project isn't proxied. Hm.
  // io.to(socket.id).emit('db test', game_sessions);

})
