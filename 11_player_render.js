// ============================================================
// 11. DRAW PLAYER
// ============================================================

window.drawPlayer = function() {

    let x =
        (
            player.x -
            camera.x
        ) *
        camera.zoom +
        canvas.width / 2;

    let y =
        (
            player.y -
            camera.y
        ) *
        camera.zoom +
        canvas.height / 2;

    let size =
        50 *
        camera.zoom;

    ctx.fillStyle =
        "black";

    ctx.fillRect(
        x - size / 2,
        y - size / 2,
        size,
        size
    );
};