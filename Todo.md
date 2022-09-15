
If you need to manually publish on Glitch:
- ./git.sh
- refresh

[ ] npm start => "tsc; node dist/server.js" is unnecessary.
    invoke "tsc" in the github webhook

Current Todo:
[x] Deploy socket.io system to Glitch
[ ] Setup backend on glitch for db tests
  [ ] Match local dev-server to Glitch's backend system
  [ ] Log troop commands to the db and setup a couple dummy accounts for the alive check

It appears to be fine, but
[ ] Downgrade packages to be compatible with Glitch's node 10.x and npm 6.14.x
[ ] Or tell Glitch to use later versions



Multiplayer Model:

  Db:

    UserId
    - Login mechanism
    - Session Auth token

    GameMetadata
    - Users whitelist
    - Scenario: Map, Funds-per-city, etc.
    - .?

      // These two are undefined right now, but they make up the mid-match reconnect and board-sync system.
    GameSessionSnapshots    // Saves board state when no users connected
    GameSessionIssuedOrders // Saves unit-by-unit commands, allowing matches to be replayed

    CustomMaps
    - All board data: size, terrain-ids, tile blobs, predeploys, etc.
    - Author
    - Some kind of reference link

  Session:

    Rooms
    - One room per GameId
    - Socket.id and User Auth is matched to a player number for this GameId, then
      - those associations are saved
      - socket.id is used for user persistence then onward
        - unless socket.user or whatever can be used for a similar purpose
    - Rooms for GameId's definitely exist while 1+ users are connected, and might not when 0 are.
    - Rooms refuse duplicate connections from User Auths to a room in session.

    Client->SendCommand
    - CommandInstruction data
      - logged to db on pass-through
      - sent to other clients in the room
    - User and player number are represented by socket.id
