window.buildings = [];
window.bullets = [];

window.turretSettings = {
    size: 1,
    range: 10,
    damage: 10,
    fireRate: 1,
    ammoCapacity: 10,
    reloadTime: 2,
    bulletSpeed: 12,
    bulletRadius: 0.12
};

window.turretAISettings = {
    targetSearchInterval: 0.15
};


// ==============================
// BUILDING
// ==============================

function buildTurret(x, y) {

    let settings = window.turretSettings;

    let turret = {
        type: "turret",

        x: x,
        y: y,

        size: settings.size,

        range: settings.range,
        damage: settings.damage,

        fireRate: settings.fireRate,

        ammo: settings.ammoCapacity,
        maxAmmo: settings.ammoCapacity,

        reloadTime: settings.reloadTime,
        reloadTimer: 0,

        fireCooldown: 0,

        target: null,
        targetSearchTimer: 0
    };

    window.buildings.push(turret);

    return turret;
}


// ==============================
// BUILDING UPDATE
// ==============================

function updateBuildings(deltaTime) {

    for (
        let i = 0;
        i < window.buildings.length;
        i++
    ) {

        let building =
            window.buildings[i];

        if (!building) continue;

        if (building.type === "turret") {
            updateTurret(
                building,
                deltaTime
            );
        }
    }
}


// ==============================
// TURRET AI
// ==============================

function updateTurret(turret, deltaTime) {

    if (turret.fireCooldown > 0) {

        turret.fireCooldown -= deltaTime;

        if (turret.fireCooldown < 0) {
            turret.fireCooldown = 0;
        }
    }


    // Reload
    if (turret.ammo <= 0) {

        turret.reloadTimer += deltaTime;

        if (
            turret.reloadTimer >=
            turret.reloadTime
        ) {

            turret.ammo =
                turret.maxAmmo;

            turret.reloadTimer = 0;
        }

        return;
    }


    // Target search
    turret.targetSearchTimer -=
        deltaTime;

    if (
        turret.targetSearchTimer <= 0
    ) {

        turret.targetSearchTimer =
            window.turretAISettings
                .targetSearchInterval;

        turret.target =
            window.getClosestWallPoint(
                turret.x + 0.5,
                turret.y + 0.5,
                turret.range
            );
    }


    if (turret.target === null) {
        return;
    }


    if (turret.fireCooldown <= 0) {
        fireTurret(turret);
    }
}


// ==============================
// FIRE
// ==============================

function fireTurret(turret) {

    if (turret.ammo <= 0) {
        return;
    }

    let target =
        turret.target;

    if (!target) {
        return;
    }


    let startX =
        turret.x + 0.5;

    let startY =
        turret.y + 0.5;


    let dx =
        target.x - startX;

    let dy =
        target.y - startY;


    let distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (distance <= 0) {
        return;
    }


    let directionX =
        dx / distance;

    let directionY =
        dy / distance;


    let bullet = {

        x: startX,
        y: startY,

        previousX: startX,
        previousY: startY,

        vx:
            directionX *
            turretSettings.bulletSpeed,

        vy:
            directionY *
            turretSettings.bulletSpeed,

        targetX:
            target.x,

        targetY:
            target.y,

        speed:
            turretSettings.bulletSpeed,

        damage:
            turret.damage,

        radius:
            turretSettings.bulletRadius
    };


    window.bullets.push(
        bullet
    );


    turret.ammo--;

    turret.fireCooldown =
        1 / turret.fireRate;


    if (
        window.stats &&
        typeof window.stats.shotsFired ===
        "number"
    ) {

        window.stats.shotsFired++;
    }
}


// ==============================
// BULLET / WALL LINE TRACE
// ==============================

function traceBulletToWall(
    oldX,
    oldY,
    newX,
    newY
) {

    if (
        typeof window.wall ===
        "undefined"
    ) {
        return null;
    }


    let wallY =
        window.wall.y;


    // The bullet must cross the Wall's
    // horizontal front edge.
    let oldSide =
        oldY < wallY;

    let newSide =
        newY < wallY;


    // No crossing this frame.
    if (oldSide === newSide) {
        return null;
    }


    let dy =
        newY - oldY;


    if (dy === 0) {
        return null;
    }


    // Find exactly where the line
    // crosses the Wall front.
    let t =
        (wallY - oldY) / dy;


    if (t < 0 || t > 1) {
        return null;
    }


    let hitX =
        oldX +
        (
            newX - oldX
        ) *
        t;


    let hitY =
        wallY;


    // Check whether this point is
    // actually solid Wall.
    if (
        typeof window.isWallSolid ===
        "function"
    ) {

        if (
            !window.isWallSolid(
                hitX,
                hitY
            )
        ) {

            return null;
        }
    }


    return {
        x: hitX,
        y: hitY
    };
}


// ==============================
// BULLET UPDATE
// ==============================

function updateBullets(deltaTime) {

    for (
        let i = window.bullets.length - 1;
        i >= 0;
        i--
    ) {

        let bullet =
            window.bullets[i];


        let oldX =
            bullet.x;

        let oldY =
            bullet.y;


        bullet.previousX =
            oldX;

        bullet.previousY =
            oldY;


        // Calculate new position
        let newX =
            oldX +
            bullet.vx *
            deltaTime;

        let newY =
            oldY +
            bullet.vy *
            deltaTime;


        // LINE TRACE
        let wallHit =
            traceBulletToWall(
                oldX,
                oldY,
                newX,
                newY
            );


        if (wallHit) {

            bullet.x =
                wallHit.x;

            bullet.y =
                wallHit.y;


            if (
                typeof window.destroyWallCircle ===
                "function"
            ) {

                window.destroyWallCircle(
                    wallHit.x,
                    wallHit.y,
                    0.8
                );
            }


            window.bullets.splice(
                i,
                1
            );

            continue;
        }


        // Update position
        bullet.x =
            newX;

        bullet.y =
            newY;


        // Check whether the bullet
        // has reached its original target.
        let targetDX =
            bullet.targetX -
            bullet.x;

        let targetDY =
            bullet.targetY -
            bullet.y;


        let targetDistance =
            Math.sqrt(
                targetDX *
                targetDX +
                targetDY *
                targetDY
            );


        if (
            targetDistance <=
            bullet.speed *
            deltaTime
        ) {

            bullet.x =
                bullet.targetX;

            bullet.y =
                bullet.targetY;


            if (
                typeof window.destroyWallCircle ===
                "function"
            ) {

                window.destroyWallCircle(
                    bullet.x,
                    bullet.y,
                    0.8
                );
            }


            window.bullets.splice(
                i,
                1
            );
        }
    }
}


// ==============================
// DRAW BUILDINGS
// ==============================

function drawBuildings() {

    for (
        let i = 0;
        i < window.buildings.length;
        i++
    ) {

        let building =
            window.buildings[i];

        if (!building) continue;

        if (
            building.type ===
            "turret"
        ) {

            drawTurret(
                building
            );
        }
    }
}


// ==============================
// DRAW TURRET
// ==============================

function drawTurret(turret) {

    let centerX =
        turret.x + 0.5;

    let centerY =
        turret.y + 0.5;


    let screenX =
        (
            centerX *
            tileSize -
            camera.x
        ) *
        camera.zoom +
        canvas.width / 2;


    let screenY =
        (
            centerY *
            tileSize -
            camera.y
        ) *
        camera.zoom +
        canvas.height / 2;


    let size =
        turret.size *
        tileSize *
        camera.zoom;


    ctx.save();

    ctx.translate(
        screenX,
        screenY
    );


    let angle = 0;

    if (turret.target) {

        let dx =
            turret.target.x -
            centerX;

        let dy =
            turret.target.y -
            centerY;

        angle =
            Math.atan2(
                dy,
                dx
            );
    }


    // Main body
    ctx.fillStyle =
        "#70777d";

    ctx.fillRect(
        -size * 0.38,
        -size * 0.38,
        size * 0.76,
        size * 0.76
    );


    // Lower section
    ctx.fillStyle =
        "#555b60";

    ctx.fillRect(
        -size * 0.38,
        size * 0.15,
        size * 0.76,
        size * 0.23
    );


    // Barrel
    ctx.save();

    ctx.rotate(angle);


    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        size * 0.05,
        -size * 0.14,
        size * 0.35,
        size * 0.28
    );


    ctx.fillStyle =
        "#111";

    ctx.fillRect(
        size * 0.25,
        -size * 0.09,
        size * 0.55,
        size * 0.18
    );


    ctx.fillStyle =
        "#050505";

    ctx.fillRect(
        size * 0.72,
        -size * 0.12,
        size * 0.13,
        size * 0.24
    );


    ctx.restore();


    // Center
    ctx.beginPath();

    ctx.arc(
        0,
        0,
        size * 0.16,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#3f4448";

    ctx.fill();


    ctx.restore();
}


// ==============================
// DRAW BULLETS
// ==============================

function drawBullets() {

    for (
        let i = 0;
        i < window.bullets.length;
        i++
    ) {

        let bullet =
            window.bullets[i];


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


        let previousScreenX =
            (
                bullet.previousX *
                tileSize -
                camera.x
            ) *
            camera.zoom +
            canvas.width / 2;


        let previousScreenY =
            (
                bullet.previousY *
                tileSize -
                camera.y
            ) *
            camera.zoom +
            canvas.height / 2;


        // Trail
        ctx.beginPath();

        ctx.moveTo(
            previousScreenX,
            previousScreenY
        );

        ctx.lineTo(
            screenX,
            screenY
        );

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth =
            Math.max(
                2,
                3 * camera.zoom
            );

        ctx.stroke();


        // Bullet
        ctx.beginPath();

        ctx.arc(
            screenX,
            screenY,
            Math.max(
                4,
                0.12 *
                tileSize *
                camera.zoom
            ),
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.fill();
    }
}


// ==============================
// BUILDING STATS
// ==============================

function updateBuildingStats() {

    if (!window.stats) {
        return;
    }

    let turretCount = 0;

    for (
        let i = 0;
        i < window.buildings.length;
        i++
    ) {

        if (
            window.buildings[i].type ===
            "turret"
        ) {

            turretCount++;
        }
    }

    window.turretCount =
        turretCount;
}


// ==============================
// GLOBAL FUNCTIONS
// ==============================

window.buildTurret =
    buildTurret;

window.updateBuildings =
    updateBuildings;

window.updateBullets =
    updateBullets;

window.drawBuildings =
    drawBuildings;

window.drawBullets =
    drawBullets;

window.updateBuildingStats =
    updateBuildingStats;


if (
    typeof window.fileLoaded ===
    "function"
) {

    window.fileLoaded(
        "15_buildings.js"
    );
           }
