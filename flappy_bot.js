(function () {

// Max value for each R, G and B value for a pixel to be considered part of the line of a pipe.
var THRESHOLD = 9,
    canvas = $('#canvas')[0],
    context = canvas.getContext('2d'),
    mouseX = 0,
    mouseY = 0,
    bounds = canvas.getBoundingClientRect();

$('canvas').mousemove(function (event) {
    mouseX = event.clientX - bounds.left;
    mouseY = event.clientY - bounds.top;
})

/**
 * Returns the current Y position of the bird (if not visible, it guesses the top).
 */
function getBirdY() {
    var birdStartX = 90,
        nColumns = 30,
        nRows = 400,
        pixels = context.getImageData(birdStartX, 0, nColumns, nRows).data,
        maxY = 0;

    for (var column = 0; column < nColumns; column++) {
        var x = birdStartX + column;

        for (var row = maxY; row < nRows; row++) {
            var startIndex = (row * nColumns + column) * 4,
                r = pixels[startIndex + 0],
                g = pixels[startIndex + 1],
                b = pixels[startIndex + 2],
                // 239, 179, 0 is the beak color. `dif` is not the color distance.
                dif = Math.abs(r - 239) + Math.abs(g - 179) + Math.abs(b - 0);

            if (dif < 10 && row > maxY) {
                maxY = row;
            }
        }
    }

    return maxY + 11;
}

/**
 * Returns the X position of first vertical line of the next pipe.
 */
function getPipeX() {
    var startX = 50;
        line = context.getImageData(startX, 0, canvas.width, 1).data;

    for (var i = 0; i < line.length; i+=4) {
        var r = line[i + 0],
            g = line[i + 1],
            b = line[i + 2];
        
        if (r < THRESHOLD && g < THRESHOLD && b < THRESHOLD) {
            var x = i / 4 + startX;
            return x;
        }
    } 
}

/**
 * Returns the bottom Y of the gap in a pipe. given the X position of the pipe.
 */
function getPipeYAt(x) {
    if (x === undefined) {
        return 0;
    }

    var column = context.getImageData(x, 0, 1, canvas.height).data;
    for (var i = 0; i < column.length; i+=4) {
        var r = column[i + 0],
            g = column[i + 1],
            b = column[i + 2];

        if (g > THRESHOLD || g > THRESHOLD || b > THRESHOLD) {
            var y = i / 4;
            return y + 146;
        }
    }
}

/**
 * Returns the maximum Y value the bird should be.
 */
function getMaxY() {
    if ($('#mousejump').is(':checked')) {
        return mouseY;
        targetY = mouseY;
    } else {
        return getPipeYAt(getPipeX());
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

var requestAnimationFrame = window.requestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.mozRequestAnimationFrame;

(function gameLoop(){
    requestAnimationFrame(gameLoop);
    if ($('#autojump').is(':checked')) {
        flap();
    }
})();

$('<label><input id="autojump" type="checkbox"> Autojump</label> <label><input id="mousejump" type="checkbox"> Jump at mouse</label>').insertAfter('#nickname');

}());