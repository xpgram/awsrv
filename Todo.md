
Learn how to:
[x] Modify tables/models
[ ] Modify serve responses (django)
[ ] Merge Node/Socket.io and Django systems
  [ ] And how to deploy them somewhere
[ ] Perform a test where the client retrieves a (the only) game metadata object.
[ ] Probably migrate the multiplayer functionality to websockets. I'll still need this django stuff for user accounts and custom maps, though.

Current Todo:
[ ] readonly_fields does nothing


Okay, I'm interjecting notes here because I don't remember what isn't useful below.

Multiplayer will be handled by sockets.
Django is still necessary for user accounts, auth, matchmaking and user custom maps.
But sockets can handle in-game, client-to-client messages.

I still need a model for how a game will retrieve the board state for a user that has disconnected and reconnected, but that'll be later. Probably the socket-code will also log moves to the game database.

Here's a neat thing, though. When a user connects, though I don't know who, someone can be chosen to communicate the current board state, so long as they're already connected.
If no one is, I guess the user will just have to reconstruct the board themselves by replaying all the known moves, but eh... we'll figure it out.

Node can also maintain a working memory of the game session. However, this means the game must be in server ram until it's finished, so... hm.



Multiplayer Model: What does the client need to send to the server?
- User Account + Auth
  - The system can infer player# from the player list
- Instruction data
- Turn ordinal? Or can this be inferred? Maybe just a timestamp, then?
Also: What does the (other) client need to ask for / receive?
Request (Send):
- User Account + Auth
- Game Id
- Last known turn ordinal
Request (Receive):
- A list of instructions (including turn change)
- The new turn ordinal to update last_known

^ Use this to construct a server-post/request demo.


[ ] Ensure users and non-users can't see gamedata they're not authorized for
  - Require a username + session_token on every http request? Is that enough?

[ ] Establish a login service for aw
  [ ] Verify two clients (two browser instances) can login to different accounts.
    [ ] Also allow cookies to save user session auth.


[ ] Setup a test game.
  [ ] The players list should include my test accounts manually. We'll work on a players-browser later; I still don't have the complete UI refactor, I want new menus.
  [ ] Clients query the server for new turn data. (by date? last known ordinal?)
    [ ] This must happen even on your turn:
      - If a player has two clients open viewing the same match, the actions must be synced.
        - Ideally this wouldn't be allowed at all. However, using two clients to play two different matches sounds cool, so I don't care about that.
      - Does this mean any turnstate must be interruptible to the ratify step? Hm. Not impossible, but I'll have to think about it.
      - If you have two clients with the same match open, this actually does introduce race conditions that could royally fuck the board sync. I don't need to worry about it *now,* but this is a severe problem. Either:
        - You cannot have two clients, or
        - You cannot have two clients viewing the same game-id
        I think this is actually solved by sockets. You'll connect by sending your user auth, and if the node server realizes that you're already connected (to that room) it just refuses.
      The latter is probably not hard to implement. That said, how can I guarantee a player's connection is refused when they already have a client/game-id open?
  [ ] When it's not your turn, you cannot give orders.
    [ ] But you can still open the field menu and quit.
  [ ] Quitting (or closing the browser) and logging back in re-assembles the game board state.
