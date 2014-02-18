/***

From https://github.com/boppreh/flappybot

This is a bot that plays by itself the Flappy Bird-based game FlappyMMO.

To use it, open the game page (http://flapmmo.com), open the browser console, paste
the contents of the file `flappy_bot.js`, and press enter to run it.

It adds two checkboxes to the top bar: "Autojump" and "Jump at mouse".

"Autojump" makes the bird automatically jump to pass the gaps on the pipes (on by default).
"Jump at mouse" changes the autojump behavior so it jumps at the mouse position (off by default).

All AI is done by reading the canvas, and the jump is done by simulating a mouse press.
Since it read the pixels value to understand the game, it may have issues on:

a) Player's nicknames (shouldn't be an issue after the 3rd pipe, where there are few people).
b) "Performance" mode, where the other birds have full alpha.
c) The end of the game, where there are no pipes remaining.

So, for best results disable "performance mode", don't use a nickname and give it a few tries
to get past the mass of the players.

PS: this was made for fun. Creating bots that understand images is always fun, and flappy is perfect
for this. I don't know if scores made this way are actually submitted, and there's no effort at
disguising itself.

***/
(function () {

// Max value for each R, G and B value for a pixel to be considered part of the line of a pipe.
var THRESHOLD = 9,
    canvas = $('#canvas')[0],
    context = canvas.getContext('2d'),
    mouseX = 0,
    mouseY = 0,
    bounds = canvas.getBoundingClientRect();

// Register a listener and store mouse position relative to the canvas.
$('canvas').mousemove(function (event) {
    mouseX = event.clientX - bounds.left;
    mouseY = event.clientY - bounds.top;
})

/**
 * Returns the current Y position of the bird (if not visible, it guesses the top).
 */
function getBirdY() {
    // Scans a thin stripe on the expected bird position, looking for the beak color.
    // The target is to return the Y position of the bottommost pixel with that color.

    // If "performance" is checked, other birds will have exactly the same beak color and it'll break.

    // Minimum X value for the part we are looking for.
    var birdStartX = 90,
        // Number of pixel columns to scan above "birdStartX".
        nColumns = 30,
        // Number of pixel rows to scan.
        nRows = 400,
        pixels = context.getImageData(birdStartX, 0, nColumns, nRows).data,
        // Desired value.
        maxY = 0;

    for (var column = 0; column < nColumns; column++) {
        var x = birdStartX + column;

        // Scans the rows from bottom to top, so we can cancel sooner when we find the beak.
        for (var row = nRows - 1; row >= maxY; row--) {
            var startIndex = (row * nColumns + column) * 4,
                r = pixels[startIndex + 0],
                g = pixels[startIndex + 1],
                b = pixels[startIndex + 2],
                // 239, 179, 0 is the beak color. `dif` is not the color distance.
                dif = Math.abs(r - 239) + Math.abs(g - 179) + Math.abs(b - 0);

            if (dif < 10 && row > maxY) {
                maxY = row;
                // We are scanning backwards, so there will be no better pixel in this column.
                break;
            }
        }
    }

    // The beak is not the bottommost part of the bird, so we add an extra value.
    // This number was reached by careful manual testing.
    return maxY + 11;
}

/**
 * Returns the X position of first vertical line of the next pipe.
 */
function getPipeX() {
    // Scans the first row of pixels on canvas and return the X position of the first blackish pixel.
    // The idea is to find the vertical black line of the first pipe.

    // Player's nicknames can break this because of their black outline.

    // Minimum X value to start searching. This is used to ignore pipes still on the screen
    // but that the bird has passed already.
    var startX = 50;
        line = context.getImageData(startX, 0, canvas.width, 1).data;

    for (var i = 0; i < line.length; i+=4) {
        var r = line[i + 0],
            g = line[i + 1],
            b = line[i + 2];
        
        // Looks black enough for me. It's probably the pipe outline.
        if (r < THRESHOLD && g < THRESHOLD && b < THRESHOLD) {
            var x = i / 4 + startX;
            return x;
        }
    } 

    // In case something goes wrong, better not return "undefined".
    return 0;
}

/**
 * Returns the bottom Y of the gap in a pipe, given the X position of the pipe.
 */
function getPipeYAt(x) {
    // Scans a column of pixels (that should be the pipe outline), looking for the top of the gap.
    // Then returns the calculated position of the bottom of the gap.

    // As with `getPipeX`, it may break with the black outline of player's nicknames.

    // This function was separated from `getPipeX` to aid debugging. The complete
    // function has been renamed `getPipeY`.

    var column = context.getImageData(x, 0, 1, canvas.height).data;

    for (var i = 0; i < column.length; i+=4) {
        var r = column[i + 0],
            g = column[i + 1],
            b = column[i + 2];

        // Looks not-black enough for me. It's probably not the pipe outline.
        if (g > THRESHOLD || g > THRESHOLD || b > THRESHOLD) {
            var y = i / 4;
            // Value measured by hand.
            return y + 146;
        }
    }

    // In case something goes wrong, better not return "undefined".
    // Also, last I checked there are no pipes after distance=100,
    // so this may be actually useful.
    return 0;
}

/**
 * Returns the bottom Y of the gap in the next pipe.
 */
function getPipeY() {
    return getPipeYAt(getPipeX())
}

/**
 * Returns the maximum Y value the bird should be.
 */
function getMaxY() {
    if ($('#mousejump').is(':checked')) {
        return mouseY;
    } else {
        return getPipeY();
    }
}

/**
 * Clicks the screen if the bird is flying too low.
 */
function flap() {
    if (getBirdY() >= getMaxY()) {
        $('canvas').mousedown();
    }
}

// Cross-browser compatible way to request frames. Intervals not included
// because they are not precise enough.
var requestAnimationFrame = window.requestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.mozRequestAnimationFrame;

(function gameLoop(){
    requestAnimationFrame(gameLoop);
    if ($('#autojump').is(':checked')) {
        flap();
    }
})();

// Creates checkboxes for "autojump" and "jump at mouse".
$('<label><input id="autojump" type="checkbox" checked="true"> Autojump</label> <label><input id="mousejump" type="checkbox"> Jump at mouse</label>').insertAfter('#nickname');

}());