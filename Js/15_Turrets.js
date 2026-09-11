// ==================================================
// 15_Turrets.js
// ==================================================


// --------------------------------------------------
// TURRET STORAGE
// --------------------------------------------------

window.turrets = [];


// Compatibility with building UI.

window.buildings =
    window.turrets;


window.turretCount = 0;


// --------------------------------------------------
// TURRET SETTINGS
// --------------------------------------------------

window.turretSettings = {

    size: 1,

    range: 10,

    damage: 100,

    fireRate: 1

};


// --------------------------------------------------
// TURRET AI SETTINGS
// --------------------------------------------------

window.turretAISettings = {

    targetSearchInterval: 0.2

};


// --------------------------------------------------
// BUILD TURRET
// --------------------------------------------------

window.buildTurret = function(
    x,
    y
) {

    let settings =
        window.turretSettings;


    let searchInterval =
        window.turretAISettings
        .targetSearchInterval;


    let turret = {

        type: "turret",

        x: x,

        y: y,

        size:
            settings.size,

        range:
            settings.range,

        damage:
            settings.damage,

        fireRate:
            settings.fireRate,

        fireCooldown: 0,

        target: null,

        targetSearchTimer:
            Math.random() *
            searchInterval

    };


    window.turrets.push(
        turret
    );


    window.turretCount++;


    return turret;
};


// --------------------------------------------------
// REMOVE TURRET
// --------------------------------------------------

window.removeTurret = function(
    index
) {

    if (
        index < 0 ||
        index >= window.turrets.length
    ) {

        return;
    }


    window.turrets.splice(
        index,
        1
    );


    window.turretCount =
        Math.max(
            0,
            window.turretCount - 1
        );
};


// --------------------------------------------------
// GET TARGET POSITION
// --------------------------------------------------

function getTargetPosition(
    target
) {

    if (!target) {
        return null;
    }


    return {

        x:
            target.tileX +
            0.5,

        y:
            window.wall.y -
            target.offsetY +
            0.5

    };
}


// --------------------------------------------------
// CHECK CURRENT TARGET
// --------------------------------------------------

function isTargetValid(
    turret
) {

    let target =
        turret.target;


    if (!target) {
        return false;
    }


    // ----------------------------------------------
    // CURRENT TARGET POSITION
    // ----------------------------------------------

    let position =
        getTargetPosition(
            target
        );


    if (!position) {
        return false;
    }


    // ----------------------------------------------
    // CHECK WALL TILE
    // ----------------------------------------------

    let currentTileY =
        Math.floor(
            window.wall.y -
            target.offsetY
        );


    if (
        !window.isWallTile(
            target.tileX,
            currentTileY
        )
    ) {

        return false;
    }


    // ----------------------------------------------
    // DISTANCE
    // ----------------------------------------------

    let turretX =
        turret.x + 0.5;

    let turretY =
        turret.y + 0.5;


    let dx =
        position.x -
        turretX;

    let dy =
        position.y -
        turretY;


    let distanceSquared =
        dx * dx +
        dy * dy;


    if (
        distanceSquared >
        turret.range *
        turret.range
    ) {

        return false;
    }


    return true;
}


// --------------------------------------------------
// UPDATE TURRETS
// --------------------------------------------------

window.updateTurrets = function(
    deltaTime
) {

    for (
        let i = 0;
        i < window.turrets.length;
        i++
    ) {

        let turret =
            window.turrets[i];


        // ------------------------------------------
        // FIRE COOLDOWN
        // ------------------------------------------

        if (
            turret.fireCooldown > 0
        ) {

            turret.fireCooldown -=
                deltaTime;
        }


        // ------------------------------------------
        // TARGET SEARCH TIMER
        // ------------------------------------------

        turret.targetSearchTimer -=
            deltaTime;


        // ------------------------------------------
        // CHECK TARGET
        // ------------------------------------------

        let targetStillValid =
            isTargetValid(
                turret
            );


        // ------------------------------------------
        // FIND NEW TARGET
        // ------------------------------------------

        if (
            !targetStillValid
        ) {

            turret.target =
                window.getClosestWallTile(
                    turret.x + 0.5,
                    turret.y + 0.5,
                    turret.range
                );

            turret.targetSearchTimer =
                window.turretAISettings
                .targetSearchInterval;
        }


        // ------------------------------------------
        // FIRE
        // ------------------------------------------

        if (
            turret.target &&
            turret.fireCooldown <= 0
        ) {

            fireTurret(
                turret
            );

            turret.fireCooldown =
                1 /
                turret.fireRate;
        }
    }
};


// --------------------------------------------------
// FIRE TURRET
// --------------------------------------------------

function fireTurret(
    turret
) {

    if (!turret.target) {
        return;
    }


    let target =
        turret.target;


    // ----------------------------------------------
    // CURRENT WALL TILE
    // ----------------------------------------------

    let currentTileY =
        Math.floor(
            window.wall.y -
            target.offsetY
        );


    // ----------------------------------------------
    // MAKE SURE TILE STILL EXISTS
    // ----------------------------------------------

    if (
        !window.isWallTile(
            target.tileX,
            currentTileY
        )
    ) {

        turret.target = null;

        return;
    }


    // ----------------------------------------------
    // DAMAGE TILE
    // ----------------------------------------------

    let destroyed =
        window.damageWallTile(
            target.tileX,
            target.offsetY,
            turret.damage
        );


    // ----------------------------------------------
    // STATISTICS
    // ----------------------------------------------

    if (window.stats) {

        window.stats.shotsFired++;

    }


    // ----------------------------------------------
    // TARGET DESTROYED
    // ----------------------------------------------

    if (destroyed) {

        /*
            Immediately forget the destroyed tile.

            The next update will find the next
            closest Wall tile.
        */

        turret.target = null;

        turret.targetSearchTimer = 0;
    }
}


// --------------------------------------------------
// DRAW TURRETS
// --------------------------------------------------

window.drawTurrets = function() {

    for (
        let i = 0;
        i < window.turrets.length;
        i++
    ) {

        let turret =
            window.turrets[i];


        // ------------------------------------------
        // SCREEN POSITION
        // ------------------------------------------

        let screenX =
            (
                (
                    turret.x +
                    0.5
                ) *
                tileSize -
                camera.x
            ) *
            camera.zoom +
            canvas.width / 2;


        let screenY =
            (
                (
                    turret.y +
                    0.5
                ) *
                tileSize -
                camera.y
            ) *
            camera.zoom +
            canvas.height / 2;


        let size =
            tileSize *
            camera.zoom;


        // ------------------------------------------
        // OFFSCREEN
        // ------------------------------------------

        if (
            screenX + size < 0 ||
            screenX - size >
                canvas.width ||
            screenY + size < 0 ||
            screenY - size >
                canvas.height
        ) {

            continue;
        }


        // ------------------------------------------
        // TURRET BODY
        // ------------------------------------------

        ctx.fillStyle =
            "#777777";


        ctx.fillRect(

            screenX -
            size * 0.3,

            screenY -
            size * 0.3,

            size * 0.6,

            size * 0.6
        );


        // ------------------------------------------
        // BARREL
        // ------------------------------------------

        let barrelX =
            screenX;

        let barrelY =
            screenY;


        if (
            turret.target
        ) {

            let target =
                getTargetPosition(
                    turret.target
                );


            if (target) {

                let dx =
                    target.x -
                    (
                        turret.x +
                        0.5
                    );


                let dy =
                    target.y -
                    (
                        turret.y +
                        0.5
                    );


                let distanceSquared =
                    dx * dx +
                    dy * dy;


                if (
                    distanceSquared > 0
                ) {

                    let distance =
                        Math.sqrt(
                            distanceSquared
                        );


                    barrelX =
                        screenX +
                        (
                            dx / distance
                        ) *
                        size *
                        0.4;


                    barrelY =
                        screenY +
                        (
                            dy / distance
                        ) *
                        size *
                        0.4;
                }
            }
        }


        // ------------------------------------------
        // BARREL DRAW
        // ------------------------------------------

        ctx.strokeStyle =
            "#111111";


        ctx.lineWidth =
            Math.max(
                3,
                size * 0.12
            );


        ctx.beginPath();


        ctx.moveTo(
            screenX,
            screenY
        );


        ctx.lineTo(
            barrelX,
            barrelY
        );


        ctx.stroke();
    }
};


// --------------------------------------------------
// NO BULLETS
// --------------------------------------------------

/*
    The game loop still calls these functions.

    They are intentionally empty so we don't have
    to change 13_game_loop.js yet.

    There are no bullet objects anymore.
*/

window.updateBullets = function() {

};


window.drawBullets = function() {

};


// --------------------------------------------------
// COMPATIBILITY WITH BUILDING UI
// --------------------------------------------------

window.removeBuilding = function(
    index
) {

    window.removeTurret(
        index
    );

};


window.updateBuildings = function(
    deltaTime
) {

    window.updateTurrets(
        deltaTime
    );

};


window.drawBuildings = function() {

    window.drawTurrets();

};


window.updateBuildingStats = function() {

    if (
        typeof window.updateStats ===
        "function"
    ) {

        window.updateStats();

    }
};


// --------------------------------------------------
// LOADER
// --------------------------------------------------

if (
    typeof window.fileLoaded ==
    "function"
) {

    window.fileLoaded(
        "15_Turrets.js"
    );

}
