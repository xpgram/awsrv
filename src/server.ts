import dotenv = require("dotenv");
//@ts-expect-error
import cmd = require("node-cmd");
import bodyParser = require("body-parser");
import crypto = require("crypto");
import express = require("express");
import cors = require("cors");
import http = require("http");
import { Server } from "socket.io";

// Setup Environment
dotenv?.config();

// Page setup
const app = express();
const server = http.createServer(app);

// Socket setup
const io = new Server(server, {
  path: "/sock",
  cors: {
    origin: "*",
    methods: ['PUT', 'GET', 'POST', 'DELETE', 'OPTIONS'],
    credentials: false,
  }
})
app.use(cors({
  origin: "*",
  optionsSuccessStatus: 200,
}));

// Setup github webhook for glitch
if (!process.env.localdevelopment) {
  console.log('[SERVER] Github webhook enabled');
  app.use(bodyParser.json());
  app.post('/git', (req, res) => {
    console.log('[SERVER] Push to origin/master detected; rebuilding...');

    let hmac = crypto.createHmac('sha1', process.env.SECRET);
    let sig = `sha1=${hmac.update(JSON.stringify(req.body)).digest('hex')}`;

    if (req.headers['x-github-event'] === 'push' && sig === req.headers['x-hub-signature']) {

      cmd.runSync('./git.sh', (err: any, data: any) => {
        if (data)
          console.log(data);
        if (err)
          console.log(err);
      })

      cmd.run('tsc; refresh');
    }

    return res.sendStatus(200);
  })
}

// Page-direct setup
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/pages/server-chat.html');
});

app.get('/sock', (req, res) => {
  res.send('');
});


// Enable server listening
const PORT = Number(
  (process.env.localdevelopment)
    ? 3001
    : process.env.PORT ?? 3000
);

server.listen(PORT, () => {
  console.log(`[SERVER] Listening on *:${PORT}`);
})


// Record information about server performance.
// TODO Migrate to imported file
module metrics {
  const MILLIS = 1000;

  // TODO These should be readonly.
  export let total_messages: number = 0;
  export let clients_connected: number = 0;

  export let players: string[] = [];

  let clients_this_activity_block: number = 0;
  let messages_this_activity_block: number = 0;
  
  module timestamps {
    export const start_server: number = Date.now();
    export let start_activity_block: number = start_server;
  }

  export function countClient() {
    clients_connected++;

    clients_this_activity_block = Math.max(
      clients_this_activity_block,
      clients_connected
    );
  }

  export function uncountClient() {
    clients_connected--;
  }

  export function countMessage() {
    total_messages++;
    messages_this_activity_block++;
  }

  /** Standardized server-metrics logging function. */
  function post(msg: string) {
    console.log(`[SERVER] ${msg}`);
  }

  /** Periodical server-metrics posting function. */
  export function logServerMetrics() {
    const now = Date.now();
    const activityBlockTime = (now - timestamps.start_activity_block) / MILLIS;
    const msgPerSecond = messages_this_activity_block / activityBlockTime;

    post(`Served ${messages_this_activity_block} messages (${msgPerSecond.toFixed(2)}ms/s) between ${clients_this_activity_block} sockets.`);
    post(`${total_messages} messages served during uptime.`);

    // Reset activity block
    timestamps.start_activity_block = now;
    clients_this_activity_block = clients_connected;
    messages_this_activity_block = 0;
  }

  export function startMetricsLogging() {
    const interval_minutes = 20;
    post(`Metrics posting active; occurring every ${interval_minutes} minutes.`);

    const interval_millis = interval_minutes * 60 * MILLIS;
    setInterval(logServerMetrics, interval_millis);
  }
}

metrics.startMetricsLogging();


// Handle user connections
io.on("connect", socket => {
  console.log(`connected ${socket.id}`);
  
  // Update server metrics info
  metrics.countClient();
  socket.onAny(metrics.countMessage);
  socket.onAnyOutgoing(metrics.countMessage);

  // Inform the client which player number they are.
  // TODO Do this by matching a user auth to a user in the Db; Do this on 'game join', not 'connection'.
  socket.on('request player number', () => {
    metrics.players.push(socket.id);
    const plnum = metrics.players.findIndex(id => socket.id === id) ?? -1;

    console.log(`assigning player ${plnum} to ${socket.id}`);
    console.log(metrics.players);
    io.to(socket.id).emit('game session data', plnum);
  });

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

  socket.on("chat message", (msg: string) => {
    const maxc = 20;
    const preview = (msg.length > maxc) ? `${msg.slice(0, maxc)}...` : msg;
    console.log(`forwarding chat message: ${preview}`);
    socket.broadcast.emit("chat message", msg);
  })

  socket.on("disconnect", reason => {
    console.log(`disconnected ${socket.id} : ${reason}`);
    metrics.uncountClient();
    metrics.players = metrics.players.filter(id => socket.id !== id);
  })

  // Server log symbols '↪ ↛ ⤮ ⥇'
  // Db log symbols '⛁⛃'

})
