/* =========================================
   14 - WALL
========================================= */

window.wall = {
    y: -50,
    speed: 1,
    thickness: 3,
    cellHealth: 30,
    destroyedCells: new Set(),
    cellHealthMap: new Map()
};


/* =========================================
   UPDATE WALL
========================================= */

window.updateWall = function(deltaTime) {

    if (window.gameOver) {
        return;
    }

    wall.y += wall.speed * deltaTime;

    if (wall.y >= 0) {

        if (typeof window.destroyCore === "function") {
            window.destroyCore();
        }
    }
};


/* =========================================
   GET WALL CELL KEY
========================================= */

window.getWallCellKey = function(x, y) {

    return x + "," + y;
};


/* =========================================
   CHECK IF WALL CELL IS DESTROYED
========================================= */

window.isWallCellDestroyed = function(x, y) {

    var key = window.getWallCellKey(x, y);

    return wall.destroyedCells.has(key);
};


/* =========================================
   FIND CLOSEST WALL CELL
========================================= */

window.getClosestWallCell = function(turretX, turretY, range) {

    var frontY = Math.floor(wall.y);

    var backY =
        frontY -
        wall.thickness +
        1;

    var closest = null;

    var closestDistance = Infinity;

    var minX =
        Math.floor(turretX - range);

    var maxX =
        Math.ceil(turretX + range);


    for (var y = backY; y <= frontY; y++) {

        for (var x = minX; x <= maxX; x++) {

            if (
                window.isWallCellDestroyed(x, y)
            ) {
                continue;
            }


            var wallX = x + 0.5;
            var wallY = y + 0.5;

            var turretXCenter =
                turretX + 0.5;

            var turretYCenter =
                turretY + 0.5;


            var dx =
                wallX -
                turretXCenter;

            var dy =
                wallY -
                turretYCenter;


            var distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance <= range &&
                distance < closestDistance
            ) {

                closestDistance = distance;

                closest = {
                    x: x,
                    y: y,
                    distance: distance
                };
            }
        }
    }


    return closest;
};


/* =========================================
   DAMAGE WALL CELL
========================================= */

window.damageWallCell = function(x, y, damage) {

    var key =
        window.getWallCellKey(x, y);


    if (
        wall.destroyedCells.has(key)
    ) {
        return;
    }


    var health =
        wall.cellHealthMap.get(key);


    if (
        health === undefined
    ) {

        health =
            wall.cellHealth;
    }


    health -= damage;


    if (
        health <= 0
    ) {

        wall.cellHealthMap.delete(key);

        wall.destroyedCells.add(key);


        if (
            typeof window.stats !== "undefined"
        ) {

            window.stats.wallDestroyed++;
        }

    } else {

        wall.cellHealthMap.set(
            key,
            health
        );
    }
};


/* =========================================
   DRAW WALL
========================================= */

window.drawWall = function() {

    var frontY =
        Math.floor(wall.y);


    var backY =
        frontY -
        wall.thickness +
        1;


    /*
        Figure out which world tiles
        are currently visible.
    */

    var worldLeft =
        wallCameraLeft();


    var worldRight =
        wallCameraRight();


    var minX =
        Math.floor(worldLeft / tileSize) - 2;


    var maxX =
        Math.ceil(worldRight / tileSize) + 2;


    /*
        Draw every Wall cell.
    */

    for (
        var y = backY;
        y <= frontY;
        y++
    ) {

        for (
            var x = minX;
            x <= maxX;
            x++
        ) {

            if (
                window.isWallCellDestroyed(x, y)
            ) {
                continue;
            }


            var screenX =
                (
                    x * tileSize -
                    camera.x
                ) *
                camera.zoom +
                canvas.width / 2;


            var screenY =
                (
                    y * tileSize -
                    camera.y
                ) *
                camera.zoom +
                canvas.height / 2;


            var size =
                tileSize *
                camera.zoom;


            ctx.fillStyle =
                "#222";


            ctx.fillRect(
                screenX,
                screenY,
                size + 1,
                size + 1
            );
        }
    }


    /*
        Draw the moving front edge.
    */

    var frontScreenY =
        (
            wall.y * tileSize -
            camera.y
        ) *
        camera.zoom +
        canvas.height / 2;


    ctx.fillStyle =
        "#111";


    ctx.fillRect(
        0,
        frontScreenY - 2,
        canvas.width,
        4
    );
};


/* =========================================
   CAMERA LEFT
========================================= */

function wallCameraLeft() {

    return (
        camera.x -
        canvas.width /
        (2 * camera.zoom)
    );
}


/* =========================================
   CAMERA RIGHT
========================================= */

function wallCameraRight() {

    return (
        camera.x +
        canvas.width /
        (2 * camera.zoom)
    );
}


/* =========================================
   FILE LOADED
========================================= */

if (
    typeof window.fileLoaded === "function"
) {

    window.fileLoaded(
        "14_wall.js"
    );
}
