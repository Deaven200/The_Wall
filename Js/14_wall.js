// ============================================================
// THE WALL
// Chunked Destructible Bitmap / Mask
// With Northward Collapse
// ============================================================

window.wall = {
    y: -50,
    speed: 1,

    chunkSize: 32,
    pixelsPerTile: 4,

    maskChunks: new Map(),

    bulletHoleRadius: 0.8,

    depth: 100000,

    canvas: null,
    ctx: null,

    lastCanvasWidth: 0,
    lastCanvasHeight: 0,

    collapseIterations: 3
};


// ============================================================
// WALL SCREEN POSITION
// ============================================================

function getWallScreenY() {

    return (
        (
            window.wall.y * tileSize -
            camera.y
        ) * camera.zoom +
        canvas.height / 2
    );
}


// ============================================================
// MASK HELPERS
// ============================================================

function getMaskSize() {

    return (
        window.wall.chunkSize *
        window.wall.pixelsPerTile
    );
}


function getMaskChunkKey(chunkX, chunkY) {

    return chunkX + "," + chunkY;
}


function getWallChunk(chunkX, chunkY) {

    let key =
        getMaskChunkKey(
            chunkX,
            chunkY
        );

    let chunk =
        window.wall.maskChunks.get(key);

    if (chunk) {
        return chunk;
    }

    let size =
        getMaskSize();

    let mask =
        new Uint8Array(
            size * size
        );

    mask.fill(1);

    chunk = {
        x: chunkX,
        y: chunkY,
        mask: mask
    };

    window.wall.maskChunks.set(
        key,
        chunk
    );

    return chunk;
}


// ============================================================
// WALL RELATIVE Y
// ============================================================

function getRelativeWallY(worldY) {

    return (
        worldY -
        window.wall.y
    );
}


// ============================================================
// WORLD → MASK POSITION
// ============================================================

function getMaskPosition(
    worldX,
    worldY
) {

    let chunkSize =
        window.wall.chunkSize;

    let pixelsPerTile =
        window.wall.pixelsPerTile;

    let relativeY =
        getRelativeWallY(
            worldY
        );

    let chunkX =
        Math.floor(
            worldX /
            chunkSize
        );

    let chunkY =
        Math.floor(
            relativeY /
            chunkSize
        );

    let localX =
        worldX -
        chunkX * chunkSize;

    let localY =
        relativeY -
        chunkY * chunkSize;

    let pixelX =
        Math.floor(
            localX *
            pixelsPerTile
        );

    let pixelY =
        Math.floor(
            localY *
            pixelsPerTile
        );

    return {
        chunkX: chunkX,
        chunkY: chunkY,
        pixelX: pixelX,
        pixelY: pixelY
    };
}


// ============================================================
// MASK COLLISION
// ============================================================

function isWallMaskSolid(
    worldX,
    worldY
) {

    let position =
        getMaskPosition(
            worldX,
            worldY
        );

    let key =
        getMaskChunkKey(
            position.chunkX,
            position.chunkY
        );

    let chunk =
        window.wall.maskChunks.get(
            key
        );

    /*
        Untouched chunks are solid.
    */

    if (!chunk) {
        return true;
    }

    let size =
        getMaskSize();

    if (
        position.pixelX < 0 ||
        position.pixelX >= size ||
        position.pixelY < 0 ||
        position.pixelY >= size
    ) {
        return true;
    }

    let index =
        position.pixelY *
        size +
        position.pixelX;

    return chunk.mask[index] !== 0;
}


// ============================================================
// WALL COLLISION
// ============================================================

function isWallSolid(
    worldX,
    worldY
) {

    if (
        worldY >=
        window.wall.y
    ) {
        return false;
    }

    return isWallMaskSolid(
        worldX,
        worldY
    );
}


// ============================================================
// GET MASK PIXEL
// ============================================================

function getMaskPixel(
    pixelX,
    pixelY
) {

    let size =
        getMaskSize();

    let chunkSize =
        window.wall.chunkSize;

    let pixelsPerTile =
        window.wall.pixelsPerTile;


    let tilesX =
        pixelX /
        pixelsPerTile;

    let tilesY =
        pixelY /
        pixelsPerTile;


    let chunkX =
        Math.floor(
            tilesX /
            chunkSize
        );

    let chunkY =
        Math.floor(
            tilesY /
            chunkSize
        );


    let localPixelX =
        pixelX -
        chunkX *
        size;

    let localPixelY =
        pixelY -
        chunkY *
        size;


    if (
        localPixelX < 0 ||
        localPixelX >= size ||
        localPixelY < 0 ||
        localPixelY >= size
    ) {
        return 1;
    }


    let chunk =
        window.wall.maskChunks.get(
            getMaskChunkKey(
                chunkX,
                chunkY
            )
        );


    /*
        A chunk that doesn't exist is solid.
    */

    if (!chunk) {
        return 1;
    }


    return chunk.mask[
        localPixelY *
        size +
        localPixelX
    ];
}


// ============================================================
// SET MASK PIXEL
// ============================================================

function setMaskPixel(
    pixelX,
    pixelY,
    value
) {

    let size =
        getMaskSize();

    let chunkSize =
        window.wall.chunkSize;

    let pixelsPerTile =
        window.wall.pixelsPerTile;


    let tilesX =
        pixelX /
        pixelsPerTile;

    let tilesY =
        pixelY /
        pixelsPerTile;


    let chunkX =
        Math.floor(
            tilesX /
            chunkSize
        );

    let chunkY =
        Math.floor(
            tilesY /
            chunkSize
        );


    let localPixelX =
        pixelX -
        chunkX *
        size;

    let localPixelY =
        pixelY -
        chunkY *
        size;


    if (
        localPixelX < 0 ||
        localPixelX >= size ||
        localPixelY < 0 ||
        localPixelY >= size
    ) {
        return;
    }


    let chunk =
        getWallChunk(
            chunkX,
            chunkY
        );


    chunk.mask[
        localPixelY *
        size +
        localPixelX
    ] = value;
}


// ============================================================
// COLLAPSE ONE AREA NORTH
// ============================================================

function collapseWallArea(
    centerWorldX,
    centerWorldY,
    radius
) {

    let pixelsPerTile =
        window.wall.pixelsPerTile;

    let centerX =
        centerWorldX *
        pixelsPerTile;

    let relativeCenterY =
        centerWorldY -
        window.wall.y;

    let centerY =
        relativeCenterY *
        pixelsPerTile;

    let radiusPixels =
        radius *
        pixelsPerTile;


    let minX =
        Math.floor(
            centerX -
            radiusPixels
        );

    let maxX =
        Math.ceil(
            centerX +
            radiusPixels
        );

    let minY =
        Math.floor(
            centerY -
            radiusPixels -
            pixelsPerTile * 4
        );

    let maxY =
        Math.ceil(
            centerY +
            radiusPixels +
            pixelsPerTile * 4
        );


    let width =
        maxX -
        minX +
        1;

    let height =
        maxY -
        minY +
        1;


    /*
        Work on a small temporary area.

        1 = Wall
        0 = empty
    */

    let area =
        new Uint8Array(
            width *
            height
        );


    for (
        let y = 0;
        y < height;
        y++
    ) {

        for (
            let x = 0;
            x < width;
            x++
        ) {

            area[
                y * width + x
            ] =
                getMaskPixel(
                    minX + x,
                    minY + y
                );
        }
    }


    /*
        Multiple passes allow material to
        move north through empty space.
    */

    for (
        let pass = 0;
        pass <
        window.wall.collapseIterations;
        pass++
    ) {

        for (
            let y = 1;
            y < height;
            y++
        ) {

            for (
                let x = 0;
                x < width;
                x++
            ) {

                let index =
                    y * width + x;


                /*
                    Already empty.
                */

                if (
                    area[index] === 0
                ) {
                    continue;
                }


                /*
                    Pixel directly NORTH.
                */

                let northIndex =
                    (
                        y - 1
                    ) *
                    width +
                    x;


                /*
                    If north is empty, this pixel
                    can fall north.
                */

                if (
                    area[northIndex] === 0
                ) {

                    area[northIndex] = 1;

                    area[index] = 0;
                }
            }
        }
    }


    /*
        Write the changed area back into
        the Wall mask.
    */

    for (
        let y = 0;
        y < height;
        y++
    ) {

        for (
            let x = 0;
            x < width;
            x++
        ) {

            let value =
                area[
                    y * width + x
                ];


            let oldValue =
                getMaskPixel(
                    minX + x,
                    minY + y
                );


            if (
                value !== oldValue
            ) {

                setMaskPixel(
                    minX + x,
                    minY + y,
                    value
                );
            }
        }
    }
}


// ============================================================
// DESTROY WALL CIRCLE
// ============================================================

function destroyWallCircle(
    worldX,
    worldY,
    radius
) {

    if (
        worldY >
        window.wall.y + 0.05
    ) {
        return false;
    }


    let pixelsPerTile =
        window.wall.pixelsPerTile;


    let chunkSize =
        window.wall.chunkSize;


    let centerX =
        worldX *
        pixelsPerTile;


    let centerY =
        (
            worldY -
            window.wall.y
        ) *
        pixelsPerTile;


    let radiusPixels =
        radius *
        pixelsPerTile;


    let minX =
        Math.floor(
            centerX -
            radiusPixels
        );

    let maxX =
        Math.ceil(
            centerX +
            radiusPixels
        );

    let minY =
        Math.floor(
            centerY -
            radiusPixels
        );

    let maxY =
        Math.ceil(
            centerY +
            radiusPixels
        );


    let radiusSquared =
        radiusPixels *
        radiusPixels;


    let changed =
        false;


    for (
        let py = minY;
        py <= maxY;
        py++
    ) {

        for (
            let px = minX;
            px <= maxX;
            px++
        ) {

            let dx =
                px -
                centerX;

            let dy =
                py -
                centerY;


            if (
                dx * dx +
                dy * dy >
                radiusSquared
            ) {
                continue;
            }


            let pixelWorldY =
                window.wall.y +
                py /
                pixelsPerTile;


            if (
                pixelWorldY >
                window.wall.y + 0.05
            ) {
                continue;
            }


            let oldValue =
                getMaskPixel(
                    px,
                    py
                );


            if (
                oldValue !== 0
            ) {

                setMaskPixel(
                    px,
                    py,
                    0
                );

                changed = true;
            }
        }
    }


    /*
        If we actually destroyed Wall,
        let nearby material collapse north.
    */

    if (changed) {

        collapseWallArea(
            worldX,
            worldY,
            radius
        );


        if (
            window.stats &&
            typeof window.stats.wallDestroyed ===
            "number"
        ) {

            window.stats.wallDestroyed++;
        }

        return true;
    }


    return false;
}


// ============================================================
// WALL CELL DAMAGE
// ============================================================

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


// ============================================================
// BUILDING COLLISION
// ============================================================

function checkWallBuildingCollision() {

    if (
        !window.buildings ||
        window.buildings.length === 0
    ) {
        return;
    }


    for (
        let i =
            window.buildings.length - 1;

        i >= 0;

        i--
    ) {

        let building =
            window.buildings[i];


        let size =
            building.size || 1;


        let left =
            building.x;

        let right =
            building.x + size;

        let top =
            building.y;

        let bottom =
            building.y + size;


        /*
            Wall has not reached building.
        */

        if (
            window.wall.y <
            top
        ) {
            continue;
        }


        /*
            Wall has already passed building.
        */

        if (
            window.wall.y >
            bottom
        ) {
            continue;
        }


        /*
            Check several points across the
            building.

            ANY solid Wall pixel touching the
            building means destruction.
        */

        let checkY =
            Math.min(
                window.wall.y,
                bottom
            );


        let points = [

            [left + 0.05, checkY],

            [right - 0.05, checkY],

            [
                (left + right) / 2,
                checkY
            ],

            [left + 0.05, top + 0.05],

            [right - 0.05, top + 0.05],

            [
                (left + right) / 2,
                top + 0.05
            ]
        ];


        let solidFound =
            false;


        for (
            let p = 0;
            p < points.length;
            p++
        ) {

            if (
                isWallSolid(
                    points[p][0],
                    points[p][1]
                )
            ) {

                solidFound = true;

                break;
            }
        }


        if (
            !solidFound
        ) {
            continue;
        }


        if (
            typeof window.removeBuilding ===
            "function"
        ) {

            window.removeBuilding(i);

        } else {

            window.buildings.splice(
                i,
                1
            );
        }
    }
}


// ============================================================
// UPDATE WALL
// ============================================================

function updateWall(deltaTime) {

    if (window.gameOver) {
        return;
    }

    window.wall.y +=
        window.wall.speed *
        deltaTime;

    checkWallBuildingCollision();
}


// ============================================================
// DRAW WALL
// ============================================================

function drawWall() {

    if (!window.wall.canvas) {
        window.wall.canvas = document.createElement("canvas");
        window.wall.ctx = window.wall.canvas.getContext("2d");
    }

    let wallCanvas = window.wall.canvas;
    let wallCtx = window.wall.ctx;

    if (
        wallCanvas.width !== canvas.width ||
        wallCanvas.height !== canvas.height
    ) {
        wallCanvas.width = canvas.width;
        wallCanvas.height = canvas.height;
        window.wall.lastCanvasWidth = canvas.width;
        window.wall.lastCanvasHeight = canvas.height;
    }

    wallCtx.clearRect(
        0,
        0,
        wallCanvas.width,
        wallCanvas.height
    );

    let frontScreenY =
        (
            window.wall.y * tileSize -
            camera.y
        ) * camera.zoom +
        canvas.height / 2;

    /*
        Draw the Wall as a solid area above
        the moving front edge.
    */

    wallCtx.fillStyle = "#555";

    wallCtx.fillRect(
        0,
        0,
        wallCanvas.width,
        Math.max(0, frontScreenY)
    );

    /*
        Cut the destructible holes out of the
        Wall mask.

        Holes are stored relative to wall.y,
        so they move with the Wall.
    */

    wallCtx.globalCompositeOperation =
        "destination-out";

    let chunkSizePixels =
        window.wall.chunkSize *
        window.wall.pixelsPerTile;

    let pixelSize =
        (
            tileSize /
            window.wall.pixelsPerTile
        ) *
        camera.zoom;

    for (let [key, chunk] of window.wall.maskChunks) {

        let parts = key.split(",");

        let chunkX = Number(parts[0]);
        let chunkY = Number(parts[1]);

        let startPixelX =
            chunkX * chunkSizePixels;

        let startPixelY =
            chunkY * chunkSizePixels;

        for (let i = 0; i < chunk.mask.length; i++) {

            if (chunk.mask[i] === 0) {

                let px = i % chunkSizePixels;
                let py = Math.floor(i / chunkSizePixels);

                let relativeWorldX =
                    (
                        startPixelX +
                        px
                    ) /
                    window.wall.pixelsPerTile;

                let relativeWorldY =
                    (
                        startPixelY +
                        py
                    ) /
                    window.wall.pixelsPerTile;

                let worldX =
                    relativeWorldX;

                let worldY =
                    window.wall.y +
                    relativeWorldY;

                let screenX =
                    (
                        worldX * tileSize -
                        camera.x
                    ) *
                    camera.zoom +
                    canvas.width / 2;

                let screenY =
                    (
                        worldY * tileSize -
                        camera.y
                    ) *
                    camera.zoom +
                    canvas.height / 2;

                wallCtx.fillRect(
                    screenX - pixelSize / 2,
                    screenY - pixelSize / 2,
                    pixelSize + 1,
                    pixelSize + 1
                );
            }
        }
    }

    wallCtx.globalCompositeOperation =
        "source-over";

    ctx.drawImage(
        wallCanvas,
        0,
        0
    );
}


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

function getClosestWallPoint(worldX, worldY, range) {

    let bestPoint = null;

    let bestDistanceSquared =
        range * range;

    let step = 0.5;

    let steps =
        Math.ceil(range / step);

    for (
        let y = -steps;
        y <= steps;
        y++
    ) {

        let testY =
            worldY + y * step;

        for (
            let x = -steps;
            x <= steps;
            x++
        ) {

            let testX =
                worldX + x * step;

            let dx =
                testX - worldX;

            let dy =
                testY - worldY;

            let distanceSquared =
                dx * dx +
                dy * dy;

            if (
                distanceSquared >=
                bestDistanceSquared
            ) {
                continue;
            }

            if (
                !isWallSolid(
                    testX,
                    testY
                )
            ) {
                continue;
            }

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

window.getClosestWallPoint =
    getClosestWallPoint;

window.getWallScreenY =
    getWallScreenY;


window.drawWall =
    drawWall;


window.updateWall =
    updateWall;

window.getClosestWallPoint =
    getClosestWallPoint;


if (typeof window.fileLoaded == "function") {
    window.fileLoaded("14_wall.js");
}
