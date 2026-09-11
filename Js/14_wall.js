// ==================================================
// 14_wall.js
// ==================================================


// --------------------------------------------------
// WALL SETTINGS
// --------------------------------------------------

window.wall = {

    // Exact front position of the Wall.
    y: -50,

    // Tiles per second.
    speed: 0.1,

    // Damaged/destroyed Wall tiles.
    //
    // Key:
    // "x,offsetY"
    //
    // Value:
    // Remaining health.
    //
    // A missing key means the tile has full health.
    damagedTiles: new Map()
};


// --------------------------------------------------
// WALL TILE KEY
// --------------------------------------------------

function getWallTileKey(x, offsetY) {

    return x + "," + offsetY;

}


// --------------------------------------------------
// WALL TILE MAX HEALTH
// --------------------------------------------------

window.wallTileMaxHealth = 100;


// --------------------------------------------------
// GET WALL TILE HEALTH
// --------------------------------------------------

window.getWallTileHealth = function(
    x,
    y
) {

    let offsetY =
        Math.floor(
            window.wall.y - y
        );


    // South of the Wall = no Wall.

    if (offsetY < 0) {
        return 0;
    }


    let key =
        getWallTileKey(
            x,
            offsetY
        );


    if (
        window.wall.damagedTiles.has(
            key
        )
    ) {

        return window.wall.damagedTiles.get(
            key
        );
    }


    // Undamaged tile.

    return window.wallTileMaxHealth;
};


// --------------------------------------------------
// CHECK IF WALL TILE EXISTS
// --------------------------------------------------

window.isWallTile = function(
    x,
    y
) {

    return (
        window.getWallTileHealth(
            x,
            y
        ) > 0
    );

};


// --------------------------------------------------
// DAMAGE WALL TILE
// --------------------------------------------------

window.damageWallTile = function(
    x,
    offsetY,
    damage
) {

    // ----------------------------------------------
    // INVALID OFFSET
    // ----------------------------------------------

    if (offsetY < 0) {
        return false;
    }


    let key =
        getWallTileKey(
            x,
            offsetY
        );


    // ----------------------------------------------
    // CURRENT HEALTH
    // ----------------------------------------------

    let health =
        window.wall.damagedTiles.has(key)
            ? window.wall.damagedTiles.get(key)
            : window.wallTileMaxHealth;


    // ----------------------------------------------
    // APPLY DAMAGE
    // ----------------------------------------------

    health -= damage;


    // ----------------------------------------------
    // DESTROYED
    // ----------------------------------------------

    if (health <= 0) {

        window.wall.damagedTiles.set(
            key,
            0
        );


        if (window.stats) {

            window.stats.wallDestroyed++;

        }


        if (
            typeof window.updateStats ===
            "function"
        ) {

            window.updateStats();

        }


        return true;
    }


    // ----------------------------------------------
    // STILL ALIVE
    // ----------------------------------------------

    window.wall.damagedTiles.set(
        key,
        health
    );


    return false;
};


// --------------------------------------------------
// FIND CLOSEST WALL TILE
// --------------------------------------------------

window.getClosestWallTile = function(
    x,
    y,
    range
) {

    let closest = null;

    let closestDistanceSquared =
        range * range;


    // ----------------------------------------------
    // SEARCH AREA
    // ----------------------------------------------

    let minX =
        Math.floor(
            x - range
        );

    let maxX =
        Math.floor(
            x + range
        );

    let minY =
        Math.floor(
            y - range
        );

    let maxY =
        Math.floor(
            y + range
        );


    // ----------------------------------------------
    // SEARCH TILES
    // ----------------------------------------------

    for (
        let tileY = minY;
        tileY <= maxY;
        tileY++
    ) {

        for (
            let tileX = minX;
            tileX <= maxX;
            tileX++
        ) {

            if (
                !window.isWallTile(
                    tileX,
                    tileY
                )
            ) {

                continue;
            }


            // --------------------------------------
            // TILE CENTER
            // --------------------------------------

            let tileCenterX =
                tileX + 0.5;

            let offsetY =
                Math.floor(
                    window.wall.y -
                    tileY
                );


            /*
                Reconstruct the current position
                of this Wall tile.

                This means the target moves with
                the Wall.
            */

            let tileCenterY =
                window.wall.y -
                offsetY +
                0.5;


            // --------------------------------------
            // DISTANCE
            // --------------------------------------

            let dx =
                tileCenterX - x;

            let dy =
                tileCenterY - y;


            let distanceSquared =
                dx * dx +
                dy * dy;


            if (
                distanceSquared >
                closestDistanceSquared
            ) {

                continue;
            }


            // --------------------------------------
            // NEW CLOSEST TILE
            // --------------------------------------

            closestDistanceSquared =
                distanceSquared;


            closest = {

                x: tileCenterX,

                y: tileCenterY,

                tileX: tileX,

                offsetY: offsetY

            };
        }
    }


    return closest;
};


// --------------------------------------------------
// WALL / BUILDING COLLISION
// --------------------------------------------------

window.checkWallBuildingCollision = function(
    building
) {

    if (!building) {
        return false;
    }


    let startX =
        Math.floor(
            building.x
        );


    let endX =
        Math.floor(
            building.x +
            building.size -
            0.001
        );


    let wallY =
        Math.floor(
            window.wall.y
        );


    for (
        let x = startX;
        x <= endX;
        x++
    ) {

        if (
            window.isWallTile(
                x,
                wallY
            )
        ) {

            return true;
        }
    }


    return false;
};


// --------------------------------------------------
// UPDATE WALL
// --------------------------------------------------

window.updateWall = function(
    deltaTime
) {

    /*
        Keep the fractional position.

        0.1 means the Wall moves 0.1 tiles
        every second.
    */

    window.wall.y +=
        window.wall.speed *
        deltaTime;

};


// --------------------------------------------------
// DRAW WALL
// --------------------------------------------------

window.drawWall = function() {

    let wallY =
        window.wall.y;


    // ----------------------------------------------
    // VISIBLE HORIZONTAL RANGE
    // ----------------------------------------------

    let startX =
        Math.floor(
            (
                camera.x -
                canvas.width /
                camera.zoom /
                2
            ) / tileSize
        ) - 1;


    let endX =
        Math.ceil(
            (
                camera.x +
                canvas.width /
                camera.zoom /
                2
            ) / tileSize
        ) + 1;


    // ----------------------------------------------
    // VISIBLE VERTICAL RANGE
    // ----------------------------------------------

    let topPixel =
        camera.y -
        canvas.height /
        camera.zoom /
        2;


    let topTile =
        Math.floor(
            topPixel /
            tileSize
        ) - 1;


    let frontTile =
        Math.floor(
            wallY
        );


    // ----------------------------------------------
    // DRAW
    // ----------------------------------------------

    ctx.fillStyle =
        "#222222";


    for (
        let y = topTile;
        y <= frontTile;
        y++
    ) {

        let offsetY =
            Math.floor(
                wallY - y
            );


        for (
            let x = startX;
            x <= endX;
            x++
        ) {

            let key =
                getWallTileKey(
                    x,
                    offsetY
                );


            // --------------------------------------
            // DESTROYED TILE
            // --------------------------------------

            if (
                window.wall.damagedTiles.get(key) ===
                0
            ) {

                continue;
            }


            // --------------------------------------
            // TILE POSITION
            // --------------------------------------

            let tileWorldY =
                wallY -
                offsetY;


            let screenX =
                (
                    x *
                    tileSize -
                    camera.x
                ) *
                camera.zoom +
                canvas.width / 2;


            let screenY =
                (
                    tileWorldY *
                    tileSize -
                    camera.y
                ) *
                camera.zoom +
                canvas.height / 2;


            let size =
                tileSize *
                camera.zoom;


            // --------------------------------------
            // DRAW TILE
            // --------------------------------------

            ctx.fillRect(
                screenX,
                screenY,
                size + 1,
                size + 1
            );
        }
    }
};


// --------------------------------------------------
// LOADER
// --------------------------------------------------

if (
    typeof window.fileLoaded ==
    "function"
) {

    window.fileLoaded(
        "14_wall.js"
    );

}
