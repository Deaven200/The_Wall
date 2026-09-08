window.wall = {
    y: -50,
    speed: 0.25,

    holes: [],

    bulletHoleRadius: 0.8,

    depth: 100000,

    canvas: null,
    ctx: null,
    lastCanvasWidth: 0,
    lastCanvasHeight: 0
};


/*
==================================================
WALL INITIALIZATION
==================================================
*/

function initializeWallCanvas() {

    if (window.wall.canvas === null) {

        window.wall.canvas =
            document.createElement("canvas");

        window.wall.ctx =
            window.wall.canvas.getContext("2d");
    }

    if (
        window.wall.canvas.width !== canvas.width ||
        window.wall.canvas.height !== canvas.height
    ) {

        window.wall.canvas.width =
            canvas.width;

        window.wall.canvas.height =
            canvas.height;

        window.wall.lastCanvasWidth =
            canvas.width;

        window.wall.lastCanvasHeight =
            canvas.height;
    }
}


/*
==================================================
WALL COORDINATES
==================================================
*/

function getWallScreenY() {

    return (
        (
            window.wall.y * tileSize -
            camera.y
        ) *
        camera.zoom +
        canvas.height / 2
    );
}


/*
==================================================
HOLES
==================================================
*/

function getHoleWorldY(hole) {

    return (
        window.wall.y +
        hole.offsetY
    );
}


function isInsideWallHole(worldX, worldY) {

    let holes =
        window.wall.holes;

    for (let i = 0; i < holes.length; i++) {

        let hole = holes[i];

        let holeY =
            getHoleWorldY(hole);

        let dx =
            worldX -
            hole.x;

        let dy =
            worldY -
            holeY;

        if (
            dx * dx +
            dy * dy <=
            hole.radius * hole.radius
        ) {

            return true;
        }
    }

    return false;
}


/*
==================================================
WALL COLLISION
==================================================
*/

function isWallSolid(worldX, worldY) {

    /*
    ----------------------------------------------
    Everything South of the Wall front is empty.
    ----------------------------------------------
    */

    if (
        worldY >=
        window.wall.y
    ) {

        return false;
    }


    /*
    ----------------------------------------------
    Holes remove Wall from the layer.
    ----------------------------------------------
    */

    if (
        isInsideWallHole(
            worldX,
            worldY
        )
    ) {

        return false;
    }


    return true;
}


/*
==================================================
DESTROY WALL
==================================================
*/

function destroyWallCircle(
    worldX,
    worldY,
    radius
) {

    /*
    ----------------------------------------------
    Don't create holes in empty space.
    ----------------------------------------------
    */

    if (
        worldY >=
        window.wall.y
    ) {

        return false;
    }


    /*
    ----------------------------------------------
    Store the hole relative to the Wall.

    This causes the hole to move with the Wall.
    ----------------------------------------------
    */

    let hole = {

        x: worldX,

        offsetY:
            worldY -
            window.wall.y,

        radius: radius
    };


    window.wall.holes.push(hole);


    /*
    ----------------------------------------------
    Statistics
    ----------------------------------------------
    */

    if (
        window.stats &&
        typeof window.stats.wallDestroyed ===
        "number"
    ) {

        window.stats.wallDestroyed++;
    }


    return true;
}


/*
==================================================
COMPATIBILITY FUNCTION
==================================================
*/

function damageWallCell(
    x,
    y,
    worldY
) {

    return destroyWallCircle(
        x + 0.5,
        worldY + 0.5,
        window.wall.bulletHoleRadius
    );
}


/*
==================================================
FIND CLOSEST WALL POINT
==================================================
*/

/*
    The Wall is an infinite layer.

    A turret can therefore be:

        1. South of the Wall front
        2. At the Wall front
        3. North of the Wall front

    In all three situations the turret can still
    find Wall within its range.

    We search a circle around the turret rather than
    assuming the Wall front is always the target.
*/

function getClosestWallPoint(
    worldX,
    worldY,
    range
) {

    let bestPoint = null;

    let bestDistanceSquared =
        range * range;


    /*
    ----------------------------------------------
    Search the area around the turret.

    We use a coarse grid first. This is much cheaper
    than the old very dense scan.
    ----------------------------------------------
    */

    let step = 0.5;

    let steps =
        Math.ceil(
            range /
            step
        );


    for (
        let y = -steps;
        y <= steps;
        y++
    ) {

        let testY =
            worldY +
            y * step;


        for (
            let x = -steps;
            x <= steps;
            x++
        ) {

            let testX =
                worldX +
                x * step;


            /*
            --------------------------------------
            Distance from turret.
            --------------------------------------
            */

            let dx =
                testX -
                worldX;

            let dy =
                testY -
                worldY;


            let distanceSquared =
                dx * dx +
                dy * dy;


            /*
            --------------------------------------
            Outside turret range.
            --------------------------------------
            */

            if (
                distanceSquared >=
                bestDistanceSquared
            ) {

                continue;
            }


            /*
            --------------------------------------
            Is this actually solid Wall?
            --------------------------------------
            */

            if (
                !isWallSolid(
                    testX,
                    testY
                )
            ) {

                continue;
            }


            /*
            --------------------------------------
            New closest target.
            --------------------------------------
            */

            bestDistanceSquared =
                distanceSquared;


            bestPoint = {

                x: testX,

                y: testY
            };
        }
    }


    return bestPoint;
}


/*
==================================================
OLD FUNCTION COMPATIBILITY
==================================================
*/

function getClosestWallCell(
    worldX,
    worldY,
    range
) {

    return getClosestWallPoint(
        worldX,
        worldY,
        range
    );
}


/*
==================================================
CORE COLLISION
==================================================
*/

function checkCoreWallCollision() {

    let core =
        window.core;


    if (
        !core ||
        core.destroyed
    ) {

        return;
    }


    for (
        let y = core.y;
        y < core.y + core.height;
        y++
    ) {

        for (
            let x = core.x;
            x < core.x + core.width;
            x++
        ) {

            if (
                isWallSolid(
                    x + 0.5,
                    y + 0.5
                )
            ) {

                window.destroyCore();

                return;
            }
        }
    }
}


/*
==================================================
BUILDING COLLISION
==================================================
*/

function checkBuildingWallCollision() {

    if (
        !window.buildings ||
        window.buildings.length === 0
    ) {

        return;
    }


    for (
        let i = 0;
        i < window.buildings.length;
        i++
    ) {

        let building =
            window.buildings[i];


        if (!building) {
            continue;
        }


        let size =
            building.size || 1;


        let destroyed =
            false;


        for (
            let y = 0;
            y < size;
            y++
        ) {

            for (
                let x = 0;
                x < size;
                x++
            ) {

                let tileX =
                    building.x +
                    x;

                let tileY =
                    building.y +
                    y;


                if (
                    isWallSolid(
                        tileX + 0.5,
                        tileY + 0.5
                    )
                ) {

                    destroyed =
                        true;

                    break;
                }
            }


            if (destroyed) {
                break;
            }
        }


        if (destroyed) {

            window.buildings.splice(
                i,
                1
            );

            i--;
        }
    }
}


/*
==================================================
WALL UPDATE
==================================================
*/

function updateWall(deltaTime) {

    /*
    ----------------------------------------------
    Smooth Wall movement.
    ----------------------------------------------
    */

    window.wall.y +=
        window.wall.speed *
        deltaTime;


    /*
    ----------------------------------------------
    Check collisions.
    ----------------------------------------------
    */

    checkCoreWallCollision();


    if (!window.gameOver) {

        checkBuildingWallCollision();
    }
}


/*
==================================================
WALL RENDERING
==================================================
*/

function drawWall() {

    initializeWallCanvas();


    let wallCanvas =
        window.wall.canvas;

    let wallCtx =
        window.wall.ctx;


    /*
    ----------------------------------------------
    Clear reusable Wall canvas.
    ----------------------------------------------
    */

    wallCtx.clearRect(
        0,
        0,
        wallCanvas.width,
        wallCanvas.height
    );


    /*
    ----------------------------------------------
    Calculate Wall front.
    ----------------------------------------------
    */

    let wallScreenY =
        getWallScreenY();


    /*
    ----------------------------------------------
    If the Wall is completely below the screen,
    there is nothing to draw.
    ----------------------------------------------
    */

    if (
        wallScreenY >=
        canvas.height
    ) {

        return;
    }


    /*
    ----------------------------------------------
    Draw the Wall layer.

    Everything above the front is Wall.
    ----------------------------------------------
    */

    wallCtx.fillStyle =
        "#555";


    wallCtx.fillRect(
        0,
        0,
        wallCanvas.width,
        Math.max(
            0,
            wallScreenY
        )
    );


    /*
    ----------------------------------------------
    Cut destruction holes.
    ----------------------------------------------
    */

    if (
        window.wall.holes.length > 0
    ) {

        wallCtx.save();


        wallCtx.globalCompositeOperation =
            "destination-out";


        for (
            let i = 0;
            i < window.wall.holes.length;
            i++
        ) {

            let hole =
                window.wall.holes[i];


            let holeWorldY =
                getHoleWorldY(hole);


            let screenX =
                (
                    hole.x * tileSize -
                    camera.x
                ) *
                camera.zoom +
                canvas.width / 2;


            let screenY =
                (
                    holeWorldY * tileSize -
                    camera.y
                ) *
                camera.zoom +
                canvas.height / 2;


            let radius =
                hole.radius *
                tileSize *
                camera.zoom;


            wallCtx.beginPath();


            wallCtx.arc(
                screenX,
                screenY,
                radius,
                0,
                Math.PI * 2
            );


            wallCtx.fill();
        }


        wallCtx.restore();
    }


    /*
    ----------------------------------------------
    Draw Wall layer over the world.
    ----------------------------------------------
    */

    ctx.drawImage(
        wallCanvas,
        0,
        0
    );
}


/*
==================================================
GLOBAL FUNCTIONS
==================================================
*/

window.getWallScreenY =
    getWallScreenY;

window.isWallSolid =
    isWallSolid;

window.destroyWallCircle =
    destroyWallCircle;

window.damageWallCell =
    damageWallCell;

window.getClosestWallPoint =
    getClosestWallPoint;

window.getClosestWallCell =
    getClosestWallCell;

window.updateWall =
    updateWall;

window.drawWall =
    drawWall;


/*
==================================================
LOADER
==================================================
*/

if (
    typeof window.fileLoaded ==
    "function"
) {

    window.fileLoaded(
        "14_wall.js"
    );
}
