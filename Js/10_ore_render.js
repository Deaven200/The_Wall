// ============================================================
// 10. DRAW ORE
// ============================================================

window.drawOre = function(
    tile,
    x,
    y,
    screenX,
    screenY,
    size
) {

    if (
        tile.type != "ore"
    ) {

        return;
    }


    // ========================================================
    // 10A. LOD 1 — TINY ORE CIRCLES
    // ========================================================

    if (
        camera.zoom > 0.75
    ) {

        // ----------------------------------------------------
        // ORE COLOR
        // ----------------------------------------------------

        if (
            tile.ore == "coal"
        ) {

            ctx.fillStyle =
                "#333";

        } else if (
            tile.ore == "copper"
        ) {

            ctx.fillStyle =
                "orange";

        } else {

            ctx.fillStyle =
                "red";
        }


        // ----------------------------------------------------
        // 100 ORE = 1 CIRCLE
        // ----------------------------------------------------

        let circles =
            Math.ceil(
                tile.amount / 100
            );


        ctx.save();


        // ----------------------------------------------------
        // KEEP CIRCLES INSIDE TILE
        // ----------------------------------------------------

        ctx.beginPath();

        ctx.rect(
            screenX,
            screenY,
            size,
            size
        );

        ctx.clip();


        // ----------------------------------------------------
        // DRAW CIRCLES
        // ----------------------------------------------------

        for (
            let i = 0;
            i < circles;
            i++
        ) {

            let randomX =
                random(
                    x,
                    y,
                    i * 2
                );


            let randomY =
                random(
                    x,
                    y,
                    i * 2 + 1
                );


            let circleX =
                screenX +
                randomX * size;


            let circleY =
                screenY +
                randomY * size;


            let radius =
                size * 0.07;


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


        ctx.restore();

        return;
    }


    // ========================================================
    // 10B. LOD 2 — ONE CIRCLE PER TILE
    // ========================================================

    if (
        camera.zoom > 0.35
    ) {

        // ----------------------------------------------------
        // ORE COLOR
        // ----------------------------------------------------

        if (
            tile.ore == "coal"
        ) {

            ctx.fillStyle =
                "#333";

        } else if (
            tile.ore == "copper"
        ) {

            ctx.fillStyle =
                "orange";

        } else {

            ctx.fillStyle =
                "red";
        }


        // ----------------------------------------------------
        // CENTER OF TILE
        // ----------------------------------------------------

        let circleX =
            screenX +
            size / 2;


        let circleY =
            screenY +
            size / 2;


        // ----------------------------------------------------
        // CIRCLE SIZE
        // ----------------------------------------------------

        let radius =
            size * 0.22;


        // ----------------------------------------------------
        // DRAW
        // ----------------------------------------------------

        ctx.beginPath();

        ctx.arc(
            circleX,
            circleY,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        return;
    }
};
