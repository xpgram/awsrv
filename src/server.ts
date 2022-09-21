import dotenv = require("dotenv");
//@ts-expect-error
import cmd = require("node-cmd");
import bodyParser = require("body-parser");
import crypto = require("crypto");
import express = require("express");
import cors = require("cors");
import http = require("http");
import { Server } from "socket.io";
import { ClientToServerEvents } from "ClientToServerEvents";
import { ServerToClientEvents } from "ServerToClientEvents";
import { InterServerEvents } from "InterServerEvents";
import { SocketData } from "SocketData";

// Setup Environment
dotenv?.config();

// Page setup
const app = express();
const server = http.createServer(app);

// Socket setup
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
  server,
  {
    path: "/sock",
    cors: {
      origin: "*",
      methods: ['PUT', 'GET', 'POST', 'DELETE', 'OPTIONS'],
      credentials: false,
    }
  }
);
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

  // Persistence variables
  // TODO Require client to send gameId on every message? SocketData, maybe?
  let gameroom: string;

  // Inform the client which player number they are.
  // TODO Do this by matching a user auth to a user in the Db; Do this on 'game join', not 'connection'.
  socket.on('RequestPlayerNumber', mapname => {
    gameroom = `game_${mapname}`;
    socket.join(gameroom); // TODO Temp/simple game segmentation

    metrics.players.push(socket.id);

    const memberCount = io.sockets.adapter.rooms.get(gameroom).size;
    const plnum = memberCount - 1;  // zero-based numbering

    // TODO P0 and P1 -> P0 leaves and comes back, still P0; no duplicate P1's
    //   This should come naturally when I add Db stuff

    console.log(`assigning player ${plnum} to ${socket.id} in ${gameroom}`);
    io.to(socket.id).emit('GameSessionData', plnum);
  })

  socket.on('LeaveGame', () => {
    console.log(`socket ${socket.id} left ${gameroom}`);
    socket.leave(gameroom);
    gameroom = '';
  })

  socket.on("TroopOrder", data => {
    console.log(`${gameroom}: instruction ${JSON.stringify(data)}`);
    socket.to(gameroom).emit("TroopOrder", data);
  })

  socket.on("EndTurn", () => {
    console.log(`${gameroom}: turn change`);
    socket.to(gameroom).emit("EndTurn");
  })

  socket.on("ChatMessage", (msg: string) => {
    const maxc = 20;
    const preview = (msg.length > maxc) ? `${msg.slice(0, maxc)}...` : msg;
    console.log(`forwarding chat message: ${preview}`);
    socket.broadcast.emit("ChatMessage", msg);
  })

  socket.on("disconnect", reason => {
    console.log(`disconnected ${socket.id} : ${reason}`);
    metrics.uncountClient();
    metrics.players = metrics.players.filter(id => socket.id !== id);
  })

  // Server log symbols '↪ ↛ ⤮ ⥇'
  // Db log symbols '⛁⛃'

})
