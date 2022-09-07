
Learn how to:
[x] Modify tables/models
[ ] Modify serve responses (django)
[ ] Merge Node/Socket.io and Django systems
  [ ] And how to deploy them somewhere


Current Todo:
[ ] (django) readonly_fields does nothing
[ ] (node) no node server exists


Okay, I'm interjecting notes here because I don't remember what isn't useful below.

Multiplayer will be handled by sockets.
Django is still necessary for user accounts, auth, matchmaking and user custom maps.
But sockets can handle in-game, client-to-client messages.

I still need a model for how a game will retrieve the board state for a user that has disconnected and reconnected, but that'll be later. Probably the socket-code will also log moves to the game database.

Here's a neat thing, though. When a user connects, though I don't know who, someone can be chosen to communicate the current board state, so long as they're already connected.
If no one is, I guess the user will just have to reconstruct the board themselves by replaying all the known moves, but eh... we'll figure it out.

Node can also maintain a working memory of the game session. However, this means the game must be in server ram until it's finished, so... hm.


Setup a test game:
- Establish the localhost connection between aw and awsrv (node)
- Irrespective of map, send all CmdInst data to server
  - Confirm other connected sockets can recieve this
  - Have them play these instructions out.
  - Film this and show it to my friend :p
- ...more to come.


Multiplayer Model:

  Db:

    UserId
    - Login mechanism
    - Session Auth token

    GameMetadata
    - Participating users
    - Scenario: Map, Funds-per-city, etc.
    - .?

    GameSessionSnapshots    // Saves board state when no users connected
    GameSessionIssuedOrders // Saves unit-by-unit commands, allowing matches to be replayed
      // These, particularly the second, are debatable

    CustomMaps
    - All board data: size, terrain-ids, tile blobs, predeploys, etc.
    - Author
    - Some kind of reference link

  Session:

    Rooms
    - Per GameId
    - Handshake on UserConnect verifies user is not already connected, otherwise refuses
    - .? Can they be suspended if no one is online right now?

    Client->SendCommand
    - CommandInstruction data
    - User Auth     // Must match the user the server is currently listening to.
    - .?
    
    CommandInstruction data will be logged into the GameSessionIssuedOrders table as it is recieved, unless it won't be. I'm focusing on the live user connections stuff right now.


[ ] Ensure users and non-users can't see gamedata they're not authorized for
  - Require a username + session_token on every http request? Is that enough?
[ ] Establish a login service for aw
  [ ] Verify two clients (two browser instances) can login to different accounts.
    [ ] Also allow cookies to save user session auth.
