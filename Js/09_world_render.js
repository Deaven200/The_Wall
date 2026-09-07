// ============================================================
// 9. WORLD RENDERING
// ============================================================


// ============================================================
// 9A. DRAW WORLD
// ============================================================

function drawWorld() {

    // --------------------------------------------------------
    // LOD 3
    // --------------------------------------------------------

    if (
        camera.zoom <= 0.35
    ) {

        drawWorldLowDetail();

        return;
    }


    // --------------------------------------------------------
    // VISIBLE AREA
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
            // TILE
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
            // GRID
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
// 9B. LOD 3 WORLD
// ============================================================

function drawWorldLowDetail() {

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
    // DRAW TILES + LOD 2 ORE
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
            // WHITE TILE
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
            // ORE
            // ------------------------------------------------

            if (
                tile.type ==
                "ore"
            ) {

                drawOreLowDetail(
                    tile,
                    screenX,
                    screenY,
                    size
                );
            }
        }
    }
}


// ============================================================
// 9C. LOD 3 ORE
// ============================================================

function drawOreLowDetail(
    tile,
    screenX,
    screenY,
    size
) {

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


    // One circle per ore tile.
    // Same idea as LOD 2, just smaller.

    let circleX =
        screenX +
        size / 2;


    let circleY =
        screenY +
        size / 2;


    let radius =
        size * 0.22;


    ctx.beginPath();

    ctx.arc(
        circleX,
        circleY,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// ============================================================
// 9D. EXPORT
// ============================================================

window.drawWorld =
    drawWorld;

window.drawWorldLowDetail =
    drawWorldLowDetail;
