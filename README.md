This is a bot that plays by itself the Flappy Bird-based game FlappyMMO.

To use it, open the game page (http://flapmmo.com), open the browser console, paste
the contents of the file `flappy_bot.js`, and press enter to run it.

It adds two checkboxes to the top bar: *Autojump* and *Jump at mouse*.

- *Autojump* makes the bird automatically jump to pass the gaps on the pipes (on by default).
- *Jump at mouse* changes the autojump behavior so it jumps at the mouse position (off by default).

All AI is done by reading the canvas, and the jump is done by simulating a mouse press.

Since it read the pixels value to understand the game, it may have issues on:

- Player's nicknames (shouldn't be an issue after the 3rd pipe, where there are few people).
- "Performance" mode, where the other birds have full alpha.
- The end of the game, where there are no pipes remaining.

So, for best results disable "performance mode", don't use a nickname and give it a few tries
to get past the mass of the players.

While it is autoplaying, you can still jump manually or change to other browser tabs.

PS: this was made for fun. Creating bots that understand images is always fun, and flappy is perfect
for this. I don't know if scores made this way are actually submitted, and there's no effort at disguising
itself.
