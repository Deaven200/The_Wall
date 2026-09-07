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
    // 10A. FULL DETAIL
    // ========================================================

    if (
        camera.zoom > 0.75
    ) {

        if (
            tile.ore == "coal"
        ) {
            ctx.fillStyle = "#333";

        } else if (
            tile.ore == "copper"
        ) {
            ctx.fillStyle = "orange";

        } else {
            ctx.fillStyle = "red";
        }


        let circles =
            Math.ceil(
                tile.amount / 100
            );


        ctx.save();


        // Only tiny circles are clipped
        // to their tile.

        ctx.beginPath();

        ctx.rect(
            screenX,
            screenY,
            size,
            size
        );

        ctx.clip();


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
    // 10B. MEDIUM DETAIL
    // ========================================================

    if (
        camera.zoom > 0.35
    ) {

        if (
            tile.ore == "coal"
        ) {
            ctx.fillStyle = "#333";

        } else if (
            tile.ore == "copper"
        ) {
            ctx.fillStyle = "orange";

        } else {
            ctx.fillStyle = "red";
        }


        let circleX =
            screenX +
            size / 2;

        let circleY =
            screenY +
            size / 2;

        let radius =
            size * 0.22;


        // No clipping here.

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