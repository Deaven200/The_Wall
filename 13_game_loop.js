// ============================================================
// 13. GAME LOOP
// ============================================================

window.gameLoop = function() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------------------------
    // SAFETY CHECK
    // --------------------------------------------------------

    if (
        !window.player
    ) {

        console.error(
            "GAME LOOP: player does not exist!"
        );

        return;
    }


    drawWorld();

    window.drawPlayer();


    requestAnimationFrame(
        window.gameLoop
    );
};


// ============================================================
// 13B. START GAME
// ============================================================

window.gameLoop();