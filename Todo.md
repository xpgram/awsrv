
Learn how to:
[x] Modify tables/models
[ ] Modify serve responses (django)
[ ] Merge Node/Socket.io and Django systems
  [ ] And how to deploy them somewhere


Current Todo:
[ ] DB migration.
  I don't want to redo a bunch of (well, a little) work, but Node+Django will be asynchronous. Or, it will require extra work to make sure socket waits for DB confirmation of any job. Conversely, *I could* just use something that integrates directly with Node and not have to worry about any of that whatsoever. Probably.
  I'm looking into it.

[ ] Deploy demo-ready (friends-ready) server
  - But make sure both (node) and (django) survive the transition
[ ] (django) readonly_fields does nothing
[ ] (django) has user tables, and (node) asks about them
[ ] (node) and (client) pass a bunch of Db-interaction tests
  Test:
  [ ] (client) can obtain a list of game-ids
  [ ] (client) can write a troop-order under one of those game-ids
  This is an alive check.
  Then we'll have a mock-login setup via assigned player numbers.
  Uh.. this needs to happen in reverse, though. You login, check game-ids, then get assigned a player number from the Players table.

[ ] hardcoded game session is used to test game infrastructure
  [ ] orders and turn changes are recorded to (django) as (node) receives them
    - I don't think turn changes are necessary for replaying/rebuilding games on reconnect
    [ ] GameSessionMessages are recorded to their game-id. If a matching table entry doesn't exist, they are not recorded.
  [ ] Online games are reconstructed from existing instruction data on [GameStart]



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
