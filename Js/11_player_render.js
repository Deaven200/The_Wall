// ============================================================
// 11. DRAW CORE
// ============================================================

window.drawCore = function() {

    if (
        !window.core
    ) {

        return;
    }


    // ========================================================
    // 11A. CORE CENTER
    // ========================================================

    let x =
        (
            core.x +
            tileSize / 2 -
            camera.x
        ) *
        camera.zoom +
        canvas.width / 2;


    let y =
        (
            core.y +
            tileSize / 2 -
            camera.y
        ) *
        camera.zoom +
        canvas.height / 2;


    // ========================================================
    // 11B. CORE SIZE
    // ========================================================

    let width =
        core.width *
        tileSize *
        camera.zoom;


    let height =
        core.height *
        tileSize *
        camera.zoom;


    // ========================================================
    // 11C. CORE
    // ========================================================

    ctx.fillStyle =
        "#555";


    ctx.fillRect(
        x - width / 2,
        y - height / 2,
        width,
        height
    );


    // ========================================================
    // 11D. CORE BORDER
    // ========================================================

    ctx.strokeStyle =
        "black";

    ctx.lineWidth =
        Math.max(
            2,
            3 * camera.zoom
        );


    ctx.strokeRect(
        x - width / 2,
        y - height / 2,
        width,
        height
    );


    // ========================================================
    // 11E. CORE CENTER
    // ========================================================

    ctx.fillStyle =
        "white";


    let centerSize =
        Math.min(
            width,
            height
        ) * 0.35;


    ctx.fillRect(
        x - centerSize / 2,
        y - centerSize / 2,
        centerSize,
        centerSize
    );
};


// ============================================================
// 11F. COMPATIBILITY
// ============================================================

window.drawPlayer =
    window.drawCore;
