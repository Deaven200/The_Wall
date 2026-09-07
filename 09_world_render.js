// ============================================================
// 9. WORLD RENDERING
// ============================================================


// ============================================================
// 9A. DRAW WORLD
// ============================================================

function drawWorld() {

    // --------------------------------------------------------
    // LOW DETAIL
    // --------------------------------------------------------

    if (
        camera.zoom <= 0.35
    ) {

        drawWorldLowDetail();

        return;
    }


    // --------------------------------------------------------
    // CALCULATE VISIBLE AREA
    // --------------------------------------------------------

    let width =
        canvas.width /
        camera.zoom /
        2;

    let height =
        canvas.height /
        camera.zoom /
        2;


    let startX =
        Math.floor(
            (
                camera.x -
                width
            ) /
            tileSize
        ) - 1;


    let endX =
        Math.ceil(
            (
                camera.x +
                width
            ) /
            tileSize
        ) + 1;


    let startY =
        Math.floor(
            (
                camera.y -
                height
            ) /
            tileSize
        ) - 1;


    let endY =
        Math.ceil(
            (
                camera.y +
                height
            ) /
            tileSize
        ) + 1;


    // --------------------------------------------------------
    // DRAW TILES
    // --------------------------------------------------------

    for (
        let y = startY;
        y <= endY;
        y++
    ) {

        for (
            let x = startX;
            x <= endX;
            x++
        ) {

            let tile =
                getTile(
                    x,
                    y
                );


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
                    y *
                    tileSize -
                    camera.y
                ) *
                camera.zoom +
                canvas.height / 2;


            let size =
                tileSize *
                camera.zoom;


            // ------------------------------------------------
            // TILE BACKGROUND
            // ------------------------------------------------

            ctx.fillStyle =
                "white";

            ctx.fillRect(
                screenX,
                screenY,
                size,
                size
            );


            // ------------------------------------------------
            // TILE GRID
            // ------------------------------------------------

            if (
                camera.zoom > 0.5
            ) {

                ctx.strokeStyle =
                    "#ddd";

                ctx.strokeRect(
                    screenX,
                    screenY,
                    size,
                    size
                );
            }


            // ------------------------------------------------
            // ORE
            // ------------------------------------------------

            if (
                tile.type ==
                "ore"
            ) {

                drawOre(
                    tile,
                    x,
                    y,
                    screenX,
                    screenY,
                    size
                );
            }
        }
    }
}


// ============================================================
// 9B. LOW DETAIL WORLD
// ============================================================

function drawWorldLowDetail() {

    // --------------------------------------------------------
    // RESET DRAWN DEPOSITS
    // --------------------------------------------------------

    window.lowDetailDeposits =
        new Set();


    // --------------------------------------------------------
    // CHUNK WORLD SIZE
    // --------------------------------------------------------

    let worldChunkSize =
        window.chunkSize *
        tileSize;


    // --------------------------------------------------------
    // VISIBLE WORLD SIZE
    // --------------------------------------------------------

    let viewWidth =
        canvas.width /
        camera.zoom;


    let viewHeight =
        canvas.height /
        camera.zoom;


    // --------------------------------------------------------
    // VISIBLE CHUNK RANGE
    // --------------------------------------------------------

    let startChunkX =
        Math.floor(
            (
                camera.x -
                viewWidth / 2
            ) /
            worldChunkSize
        ) - 1;


    let endChunkX =
        Math.ceil(
            (
                camera.x +
                viewWidth / 2
            ) /
            worldChunkSize
        ) + 1;


    let startChunkY =
        Math.floor(
            (
                camera.y -
                viewHeight / 2
            ) /
            worldChunkSize
        ) - 1;


    let endChunkY =
        Math.ceil(
            (
                camera.y +
                viewHeight / 2
            ) /
            worldChunkSize
        ) + 1;


    // ========================================================
    // 9B-1. DRAW ALL CHUNK BACKGROUNDS
    // ========================================================

    ctx.fillStyle =
        "white";


    for (
        let chunkY =
            startChunkY;

        chunkY <=
            endChunkY;

        chunkY++
    ) {

        for (
            let chunkX =
                startChunkX;

            chunkX <=
                endChunkX;

            chunkX++
        ) {

            let screenX =
                (
                    chunkX *
                    worldChunkSize -
                    camera.x
                ) *
                camera.zoom +
                canvas.width / 2;


            let screenY =
                (
                    chunkY *
                    worldChunkSize -
                    camera.y
                ) *
                camera.zoom +
                canvas.height / 2;


            let screenSize =
                worldChunkSize *
                camera.zoom;


            ctx.fillRect(
                screenX,
                screenY,
                screenSize,
                screenSize
            );
        }
    }


    // ========================================================
    // 9B-2. DRAW ALL ORE DEPOSITS
    // ========================================================

    for (
        let chunkY =
            startChunkY;

        chunkY <=
            endChunkY;

        chunkY++
    ) {

        for (
            let chunkX =
                startChunkX;

            chunkX <=
                endChunkX;

            chunkX++
        ) {

            drawChunkDeposits(
                chunkX,
                chunkY
            );
        }
    }
}


// ============================================================
// 9C. DRAW CHUNK DEPOSITS
// ============================================================

function drawChunkDeposits(
    chunkX,
    chunkY
) {

    // --------------------------------------------------------
    // HOW MANY POINTS TO CHECK
    // --------------------------------------------------------

    let samples = 8;


    // --------------------------------------------------------
    // CHECK SAMPLE POINTS
    // --------------------------------------------------------

    for (
        let sy = 0;
        sy < samples;
        sy++
    ) {

        for (
            let sx = 0;
            sx < samples;
            sx++
        ) {

            // ------------------------------------------------
            // CONVERT SAMPLE TO WORLD COORDINATES
            // ------------------------------------------------

            let worldX =
                chunkX *
                window.chunkSize +
                (
                    sx + 0.5
                ) *
                window.chunkSize /
                samples;


            let worldY =
                chunkY *
                window.chunkSize +
                (
                    sy + 0.5
                ) *
                window.chunkSize /
                samples;


            // ------------------------------------------------
            // GET TILE
            // ------------------------------------------------

            let tile =
                getTile(
                    Math.floor(worldX),
                    Math.floor(worldY)
                );


            if (
                tile.type !=
                "ore"
            ) {

                continue;
            }


            // =================================================
            // FIND DEPOSIT CENTER
            // =================================================

            let spacing = 35;


            let regionX =
                Math.floor(
                    worldX /
                    spacing
                );


            let regionY =
                Math.floor(
                    worldY /
                    spacing
                );


            let bestDistance =
                Infinity;


            let bestX = 0;
            let bestY = 0;


            // ------------------------------------------------
            // CHECK NEARBY REGIONS
            // ------------------------------------------------

            for (
                let ry =
                    regionY - 1;

                ry <=
                    regionY + 1;

                ry++
            ) {

                for (
                    let rx =
                        regionX - 1;

                    rx <=
                        regionX + 1;

                    rx++
                ) {

                    // ----------------------------------------
                    // RECREATE DEPOSIT POSITION
                    // ----------------------------------------

                    let depositX =
                        rx *
                        spacing +
                        random(
                            rx,
                            ry,
                            10
                        ) *
                        spacing;


                    let depositY =
                        ry *
                        spacing +
                        random(
                            rx,
                            ry,
                            11
                        ) *
                        spacing;


                    // ----------------------------------------
                    // DISTANCE
                    // ----------------------------------------

                    let dx =
                        worldX -
                        depositX;


                    let dy =
                        worldY -
                        depositY;


                    let distance =
                        Math.sqrt(
                            dx * dx +
                            dy * dy
                        );


                    // ----------------------------------------
                    // CLOSEST DEPOSIT
                    // ----------------------------------------

                    if (
                        distance <
                        bestDistance
                    ) {

                        bestDistance =
                            distance;

                        bestX =
                            depositX;

                        bestY =
                            depositY;
                    }
                }
            }


            // =================================================
            // UNIQUE DEPOSIT ID
            // =================================================

            let depositID =
                Math.floor(
                    bestX /
                    spacing
                ) +
                "," +
                Math.floor(
                    bestY /
                    spacing
                );


            let uniqueID =
                depositID +
                ":" +
                tile.ore;


            // ------------------------------------------------
            // ALREADY DRAWN?
            // ------------------------------------------------

            if (
                window.lowDetailDeposits
                    .has(uniqueID)
            ) {

                continue;
            }


            window.lowDetailDeposits.add(
                uniqueID
            );


            // =================================================
            // ORE COLOR
            // =================================================

            if (
                tile.ore ==
                "coal"
            ) {

                ctx.fillStyle =
                    "#333";

            } else if (
                tile.ore ==
                "copper"
            ) {

                ctx.fillStyle =
                    "orange";

            } else {

                ctx.fillStyle =
                    "red";
            }


            // =================================================
            // DEPOSIT SCREEN POSITION
            // =================================================

            let depositScreenX =
                (
                    bestX *
                    tileSize -
                    camera.x
                ) *
                camera.zoom +
                canvas.width / 2;


            let depositScreenY =
                (
                    bestY *
                    tileSize -
                    camera.y
                ) *
                camera.zoom +
                canvas.height / 2;


            // =================================================
            // DEPOSIT RADIUS
            // =================================================

            let regionForRadiusX =
                Math.floor(
                    bestX /
                    spacing
                );


            let regionForRadiusY =
                Math.floor(
                    bestY /
                    spacing
                );


            let radius =
                4 +
                random(
                    regionForRadiusX,
                    regionForRadiusY,
                    51
                ) *
                10;


            // ------------------------------------------------
            // DISTANCE SCALING
            // ------------------------------------------------

            let distanceFromStart =
                Math.sqrt(
                    bestX * bestX +
                    bestY * bestY
                );


            let distanceMultiplier =
                Math.pow(
                    1.1,
                    distanceFromStart /
                    1000
                );


            radius *=
                distanceMultiplier;


            // =================================================
            // CONVERT TO SCREEN RADIUS
            // =================================================

            let circleRadius =
                radius *
                tileSize *
                camera.zoom;


            // =================================================
            // DRAW COMPLETE CIRCLE
            // =================================================

            ctx.beginPath();

            ctx.arc(
                depositScreenX,
                depositScreenY,
                circleRadius,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }
}


// ============================================================
// 9D. EXPORT
// ============================================================

window.drawWorld =
    drawWorld;

window.drawWorldLowDetail =
    drawWorldLowDetail;

window.drawChunkDeposits =
    drawChunkDeposits;