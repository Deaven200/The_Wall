window.gameOver = false;

var lastTime = performance.now();

window.gameLoop = function(currentTime) {

    var deltaTime =
        (currentTime - lastTime) / 1000;

    lastTime = currentTime;

    deltaTime =
        Math.min(deltaTime, 0.1);


    /* UPDATE */

    if (!window.gameOver) {

        window.updateWall(deltaTime);

        window.updateBuildings(deltaTime);

        window.updateBullets(deltaTime);

        if (typeof window.updateBuildingStats === "function") {
            window.updateBuildingStats();
        }
    }


    /* CLEAR */

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* DRAW */

    window.drawWorld();

    window.drawWall();

    window.drawBuildings();

    window.drawBullets();

    window.drawCore();


    /* GAME OVER */

    if (window.gameOver) {

        drawGameOver();
    }


    /* STATS */

    if (typeof window.updateStats === "function") {

        window.updateStats();
    }


    requestAnimationFrame(
        window.gameLoop
    );
};


/* =========================================
   GAME OVER SCREEN
========================================= */

function drawGameOver() {

    ctx.fillStyle =
        "rgba(0, 0, 0, 0.6)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.fillStyle =
        "white";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    ctx.font =
        "bold 48px sans-serif";

    ctx.fillText(
        "GAME OVER",
        canvas.width / 2,
        canvas.height / 2
    );


    ctx.font =
        "20px sans-serif";

    ctx.fillText(
        "The Wall reached the Core",
        canvas.width / 2,
        canvas.height / 2 + 50
    );
}


/* =========================================
   START
========================================= */

window.gameLoop(
    performance.now()
);
