/* =========================================
   15 - BUILDINGS
========================================= */

window.buildings = [];

window.bullets = [];


/* =========================================
   TURRET SETTINGS
========================================= */

window.turretSettings = {
    size: 1,

    range: 10,

    damage: 10,

    fireRate: 1,

    ammoCapacity: 10,

    reloadTime: 2
};


/* =========================================
   BUILD TURRET
========================================= */

window.buildTurret = function(x, y) {

    buildings.push({

        type: "turret",

        /*
            These are TILE coordinates.

            Example:
            x = 5
            y = -2

            means the turret is sitting
            on world tile (5, -2).
        */

        x: x,
        y: y,

        size: 1,

        range:
            turretSettings.range,

        damage:
            turretSettings.damage,

        fireRate:
            turretSettings.fireRate,

        ammo:
            turretSettings.ammoCapacity,

        ammoCapacity:
            turretSettings.ammoCapacity,

        fireCooldown: 0,

        reloadTimer: 0
    });
};


/* =========================================
   UPDATE BUILDINGS
========================================= */

window.updateBuildings = function(deltaTime) {

    for (
        let turret of buildings
    ) {

        if (
            turret.type !== "turret"
        ) {
            continue;
        }


        /* =========================
           RELOAD
        ========================= */

        if (
            turret.ammo <= 0
        ) {

            turret.reloadTimer +=
                deltaTime;


            if (
                turret.reloadTimer >=
                turretSettings.reloadTime
            ) {

                turret.ammo =
                    turret.ammoCapacity;

                turret.reloadTimer = 0;
            }

            continue;
        }


        /* =========================
           FIRE COOLDOWN
        ========================= */

        if (
            turret.fireCooldown > 0
        ) {

            turret.fireCooldown -=
                deltaTime;

            continue;
        }


        /* =========================
           FIND WALL TARGET
        ========================= */

        let target = null;

        if (
            typeof getClosestWallCell ===
            "function"
        ) {

            target =
                getClosestWallCell(
                    turret.x,
                    turret.y,
                    turret.range
                );
        }


        if (!target) {
            continue;
        }


        /* =========================
           FIRE
        ========================= */

        fireTurret(
            turret,
            target
        );
    }
};


/* =========================================
   FIRE TURRET
========================================= */

function fireTurret(
    turret,
    target
) {

    turret.ammo--;

    turret.fireCooldown =
        1 / turret.fireRate;


    if (
        typeof stats !== "undefined"
    ) {

        stats.shotsFired++;
    }


    /*
        Turret center.

        Turret x/y are TILE coordinates,
        so +0.5 gives the center of the tile.
    */

    let startX =
        turret.x + 0.5;

    let startY =
        turret.y + 0.5;


    /*
        Wall cell center.
    */

    let targetX =
        target.x + 0.5;

    let targetY =
        target.y + 0.5;


    bullets.push({

        x: startX,

        y: startY,

        targetX: targetX,

        targetY: targetY,

        speed: 20,

        damage:
            turret.damage,

        wallX:
            target.x,

        wallY:
            target.y
    });
}


/* =========================================
   UPDATE BULLETS
========================================= */

window.updateBullets = function(deltaTime) {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        let bullet =
            bullets[i];


        let dx =
            bullet.targetX -
            bullet.x;


        let dy =
            bullet.targetY -
            bullet.y;


        let distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        let movement =
            bullet.speed *
            deltaTime;


        /* =========================
           BULLET HIT
        ========================= */

        if (
            distance <= movement
        ) {

            bullet.x =
                bullet.targetX;

            bullet.y =
                bullet.targetY;


            if (
                typeof damageWallCell ===
                "function"
            ) {

                damageWallCell(
                    bullet.wallX,
                    bullet.wallY,
                    bullet.damage
                );
            }


            bullets.splice(
                i,
                1
            );

            continue;
        }


        /* =========================
           MOVE BULLET
        ========================= */

        bullet.x +=
            (dx / distance) *
            movement;

        bullet.y +=
            (dy / distance) *
            movement;
    }
};


/* =========================================
   DRAW BUILDINGS
========================================= */

window.drawBuildings = function() {

    for (
        let building of buildings
    ) {

        if (
            building.type === "turret"
        ) {

            drawTurret(
                building
            );
        }
    }
};


/* =========================================
   DRAW TURRET
========================================= */

function drawTurret(turret) {

    /*
        IMPORTANT:

        turret.x/y are TILE coordinates.

        Convert them to pixel coordinates
        here.
    */

    let centerX =
        (
            turret.x + 0.5
        ) *
        tileSize;


    let centerY =
        (
            turret.y + 0.5
        ) *
        tileSize;


    /*
        Apply camera.

        camera.x/y are PIXEL coordinates.
    */

    centerX =
        (
            centerX -
            camera.x
        ) *
        camera.zoom +
        canvas.width / 2;


    centerY =
        (
            centerY -
            camera.y
        ) *
        camera.zoom +
        canvas.height / 2;


    let size =
        tileSize *
        camera.zoom;


    /* =========================
       TURRET BASE
    ========================= */

    ctx.fillStyle =
        "#777";


    ctx.fillRect(

        centerX -
            size * 0.4,

        centerY -
            size * 0.4,

        size * 0.8,

        size * 0.8
    );


    /* =========================
       FIND TARGET
    ========================= */

    let target = null;

    if (
        typeof getClosestWallCell ===
        "function"
    ) {

        target =
            getClosestWallCell(
                turret.x,
                turret.y,
                turret.range
            );
    }


    /* =========================
       BARREL
    ========================= */

    if (target) {

        let targetX =
            (
                target.x + 0.5
            ) *
            tileSize;


        let targetY =
            (
                target.y + 0.5
            ) *
            tileSize;


        targetX =
            (
                targetX -
                camera.x
            ) *
            camera.zoom +
            canvas.width / 2;


        targetY =
            (
                targetY -
                camera.y
            ) *
            camera.zoom +
            canvas.height / 2;


        let dx =
            targetX -
            centerX;


        let dy =
            targetY -
            centerY;


        let angle =
            Math.atan2(
                dy,
                dx
            );


        let barrelLength =
            size * 0.45;


        let barrelWidth =
            Math.max(
                3,
                size * 0.14
            );


        ctx.save();


        ctx.translate(
            centerX,
            centerY
        );


        ctx.rotate(
            angle
        );


        ctx.fillStyle =
            "#222";


        /*
            Starts EXACTLY at the
            turret center.
        */

        ctx.fillRect(

            0,

            -barrelWidth / 2,

            barrelLength,

            barrelWidth
        );


        ctx.restore();
    }


    /* =========================
       CENTER OF TURRET
    ========================= */

    ctx.fillStyle =
        "#aaa";


    ctx.beginPath();


    ctx.arc(

        centerX,

        centerY,

        Math.max(
            3,
            size * 0.18
        ),

        0,

        Math.PI * 2
    );


    ctx.fill();
}


/* =========================================
   DRAW BULLETS
========================================= */

window.drawBullets = function() {

    for (
        let bullet of bullets
    ) {

        /*
            Bullet coordinates are WORLD TILE
            coordinates, including decimals.

            Convert to pixels here.
        */

        let screenX =
            (
                bullet.x *
                tileSize -
                camera.x
            ) *
            camera.zoom +
            canvas.width / 2;


        let screenY =
            (
                bullet.y *
                tileSize -
                camera.y
            ) *
            camera.zoom +
            canvas.height / 2;


        let radius =
            Math.max(
                2,
                3 * camera.zoom
            );


        ctx.fillStyle =
            "#111";


        ctx.beginPath();


        ctx.arc(

            screenX,

            screenY,

            radius,

            0,

            Math.PI * 2
        );


        ctx.fill();
    }
};


/* =========================================
   BUILDING STATS
========================================= */

window.updateBuildingStats = function() {

    let turretCount = 0;


    for (
        let building of buildings
    ) {

        if (
            building.type === "turret"
        ) {

            turretCount++;
        }
    }


    window.turretCount =
        turretCount;
};


/* =========================================
   FILE LOADED
========================================= */

if (
    typeof window.fileLoaded ==
    "function"
) {

    window.fileLoaded(
        "15_buildings.js"
    );
}
