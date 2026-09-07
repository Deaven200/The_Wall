// ============================================================
// 1. CANVAS
// ============================================================

let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

canvas.style.touchAction = "none";


// ============================================================
// 2. PLAYER
// ============================================================

let player = {
    x: 0,
    y: 0
};


// ============================================================
// 3. CAMERA
// ============================================================

let camera = {
    x: 0,
    y: 0,
    zoom: 1
};

let tileSize = 50;


// ============================================================
// 4. WORLD SETTINGS
// ============================================================

let chunkSize = 32;

let chunks = new Map();


// ============================================================
// 5. RANDOM NUMBER
// ============================================================

function random(x, y, extra = 0) {

    let value =
        Math.sin(
            x * 12.9898 +
            y * 78.233 +
            extra * 37.719
        ) * 43758.5453;

    return value - Math.floor(value);
}


// ============================================================
// 6. VEIN GENERATOR
// ============================================================

function getVein(x, y) {

    let spacing = 35;

    let regionX = Math.floor(x / spacing);
    let regionY = Math.floor(y / spacing);

    let bestDistance = Infinity;

    let bestX = 0;
    let bestY = 0;


    // Check nearby deposit locations

    for (
        let ry = regionY - 1;
        ry <= regionY + 1;
        ry++
    ) {

        for (
            let rx = regionX - 1;
            rx <= regionX + 1;
            rx++
        ) {

            let depositX =
                rx * spacing +
                random(rx, ry, 10) * spacing;

            let depositY =
                ry * spacing +
                random(rx, ry, 11) * spacing;


            let dx = x - depositX;
            let dy = y - depositY;

            let distance =
                Math.sqrt(dx * dx + dy * dy);


            if (distance < bestDistance) {

                bestDistance = distance;

                bestX = depositX;
                bestY = depositY;
            }
        }
    }


    // Deposit identity

    let depositX =
        Math.floor(bestX / spacing);

    let depositY =
        Math.floor(bestY / spacing);


    // Chance that this deposit exists

    let depositChance =
        random(
            depositX,
            depositY,
            50
        );


    if (depositChance > 0.30) {

        return {
            type: "empty",
            ore: null,
            amount: 0
        };
    }


    // Deposit radius

    let radius =
        4 +
        random(
            depositX,
            depositY,
            51
        ) * 10;


    // Irregular edge

    let edge =
        radius *
        (
            0.75 +
            random(
                x,
                y,
                52
            ) * 0.5
        );


    if (bestDistance > edge) {

        return {
            type: "empty",
            ore: null,
            amount: 0
        };
    }


    // Ore type

    let oreValue =
        random(
            depositX,
            depositY,
            60
        );


    let ore;

    if (oreValue < 0.20)
        ore = "iron";

    else if (oreValue < 0.50)
        ore = "copper";

    else
        ore = "coal";


    // Richer toward center

    let richness =
        1 -
        bestDistance / radius;

    richness =
        Math.max(
            0,
            richness
        );


    let amount =
        Math.ceil(
            (
                100 +
                richness * 900 +
                random(x, y, 70) * 200
            ) / 100
        ) * 100;


    return {
        type: "ore",
        ore: ore,
        amount: amount
    };
}


// ============================================================
// 7. CHUNK GENERATION
// ============================================================

function generateChunk(chunkX, chunkY) {

    let key =
        chunkX + "," + chunkY;


    // Already generated?

    if (chunks.has(key))
        return chunks.get(key);


    let chunk = [];


    for (let y = 0; y < chunkSize; y++) {

        let row = [];


        for (let x = 0; x < chunkSize; x++) {

            let worldX =
                chunkX * chunkSize + x;

            let worldY =
                chunkY * chunkSize + y;


            row.push(
                getVein(
                    worldX,
                    worldY
                )
            );
        }


        chunk.push(row);
    }


    chunks.set(key, chunk);

    return chunk;
}


// ============================================================
// 8. GET TILE
// ============================================================

function getTile(x, y) {

    let chunkX =
        Math.floor(x / chunkSize);

    let chunkY =
        Math.floor(y / chunkSize);


    let localX =
        x - chunkX * chunkSize;

    let localY =
        y - chunkY * chunkSize;


    let chunk =
        generateChunk(
            chunkX,
            chunkY
        );


    return chunk[localY][localX];
}


// ============================================================
// 9. DRAW WORLD
// ============================================================

function drawWorld() {

    // Reset low-detail deposit tracking
    // every frame.

    window.lowDetailDeposits =
        new Set();


    // ZOOMED OUT

    if (camera.zoom <= 0.35) {

        drawWorldLowDetail();

        return;
    }

    // --------------------------------------------------------
    // NORMAL DETAIL
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
            (camera.x - width) /
            tileSize
        ) - 1;

    let endX =
        Math.ceil(
            (camera.x + width) /
            tileSize
        ) + 1;


    let startY =
        Math.floor(
            (camera.y - height) /
            tileSize
        ) - 1;

    let endY =
        Math.ceil(
            (camera.y + height) /
            tileSize
        ) + 1;


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
                getTile(x, y);


            let screenX =
                (x * tileSize - camera.x) *
                camera.zoom +
                canvas.width / 2;

            let screenY =
                (y * tileSize - camera.y) *
                camera.zoom +
                canvas.height / 2;

            let size =
                tileSize *
                camera.zoom;


            // White tile

            ctx.fillStyle = "white";

            ctx.fillRect(
                screenX,
                screenY,
                size,
                size
            );


            // Grid

            if (camera.zoom > 0.5) {

                ctx.strokeStyle = "#ddd";

                ctx.strokeRect(
                    screenX,
                    screenY,
                    size,
                    size
                );
            }


            // Ore

            if (tile.type == "ore") {

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
// 9B. DRAW WORLD LOW DETAIL
// ============================================================

function drawWorldLowDetail() {

    // How much world one chunk represents.
    //
    // Your chunks are 32 x 32 tiles.
    // So one chunk represents:
    //
    // 32 * 50 = 1600 world units.

    let worldChunkSize =
        chunkSize * tileSize;


    // Figure out which chunks are visible.

    let viewWidth =
        canvas.width /
        camera.zoom;

    let viewHeight =
        canvas.height /
        camera.zoom;


    let startChunkX =
        Math.floor(
            (
                camera.x -
                viewWidth / 2
            ) /
            worldChunkSize
        ) - 1;


    let endChunkX =
        Math.ceil(
            (
                camera.x +
                viewWidth / 2
            ) /
            worldChunkSize
        ) + 1;


    let startChunkY =
        Math.floor(
            (
                camera.y -
                viewHeight / 2
            ) /
            worldChunkSize
        ) - 1;


    let endChunkY =
        Math.ceil(
            (
                camera.y +
                viewHeight / 2
            ) /
            worldChunkSize
        ) + 1;


    // --------------------------------------------------------
    // Draw each visible chunk
    // --------------------------------------------------------

    for (
        let chunkY = startChunkY;
        chunkY <= endChunkY;
        chunkY++
    ) {

        for (
            let chunkX = startChunkX;
            chunkX <= endChunkX;
            chunkX++
        ) {

            // Draw the chunk background.

            let screenX =
                (
                    chunkX *
                    worldChunkSize -
                    camera.x
                ) *
                camera.zoom +
                canvas.width / 2;


            let screenY =
                (
                    chunkY *
                    worldChunkSize -
                    camera.y
                ) *
                camera.zoom +
                canvas.height / 2;


            let screenSize =
                worldChunkSize *
                camera.zoom;


            ctx.fillStyle = "white";

            ctx.fillRect(
                screenX,
                screenY,
                screenSize,
                screenSize
            );


            // ------------------------------------------------
            // Find ore deposits inside this chunk.
            // ------------------------------------------------

            drawChunkDeposits(
                chunkX,
                chunkY,
                screenX,
                screenY,
                screenSize,
                worldChunkSize
            );
        }
    }
}


// ============================================================
// 9C. DRAW CHUNK DEPOSITS
// ============================================================

function drawChunkDeposits(
    chunkX,
    chunkY,
    screenX,
    screenY,
    screenSize,
    worldChunkSize
) {

    // We sample the chunk instead of checking
    // every single tile.
    //
    // This is the important performance trick.
    //
    // Instead of:
    //
    // 32 x 32 = 1024 tiles
    //
    // we check only a few points.

    let samples = 8;


    for (
        let sy = 0;
        sy < samples;
        sy++
    ) {

        for (
            let sx = 0;
            sx < samples;
            sx++
        ) {

            let worldX =
                chunkX *
                chunkSize +
                (
                    sx + 0.5
                ) *
                chunkSize /
                samples;


            let worldY =
                chunkY *
                chunkSize +
                (
                    sy + 0.5
                ) *
                chunkSize /
                samples;


            // Convert to tile coordinates.

            let tileX =
                Math.floor(worldX);

            let tileY =
                Math.floor(worldY);


            let tile =
                getTile(
                    tileX,
                    tileY
                );


            if (tile.type != "ore")
                continue;


            // ------------------------------------------------
            // Deposit center
            // ------------------------------------------------

            let spacing = 35;


            let regionX =
                Math.floor(
                    worldX / spacing
                );


            let regionY =
                Math.floor(
                    worldY / spacing
                );


            let bestDistance =
                Infinity;

            let bestX = 0;
            let bestY = 0;


            for (
                let ry = regionY - 1;
                ry <= regionY + 1;
                ry++
            ) {

                for (
                    let rx = regionX - 1;
                    rx <= regionX + 1;
                    rx++
                ) {

                    let depositX =
                        rx * spacing +
                        random(
                            rx,
                            ry,
                            10
                        ) *
                        spacing;


                    let depositY =
                        ry * spacing +
                        random(
                            rx,
                            ry,
                            11
                        ) *
                        spacing;


                    let dx =
                        worldX -
                        depositX;


                    let dy =
                        worldY -
                        depositY;


                    let distance =
                        Math.sqrt(
                            dx * dx +
                            dy * dy
                        );


                    if (
                        distance <
                        bestDistance
                    ) {

                        bestDistance =
                            distance;

                        bestX =
                            depositX;

                        bestY =
                            depositY;
                    }
                }
            }


            // Deposit ID

            let depositID =
                Math.floor(
                    bestX / spacing
                ) +
                "," +
                Math.floor(
                    bestY / spacing
                );


            // Don't draw the same deposit
            // repeatedly.

            if (
                !window.lowDetailDeposits
            ) {

                window.lowDetailDeposits =
                    new Set();
            }


            let uniqueID =
                depositID +
                ":" +
                tile.ore;


            if (
                window.lowDetailDeposits.has(
                    uniqueID
                )
            ) {

                continue;
            }


            window.lowDetailDeposits.add(
                uniqueID
            );


            // ------------------------------------------------
            // Draw deposit
            // ------------------------------------------------

            if (tile.ore == "coal")
                ctx.fillStyle = "#333";

            else if (tile.ore == "copper")
                ctx.fillStyle = "orange";

            else
                ctx.fillStyle = "red";


            let depositScreenX =
                (
                    bestX *
                    tileSize -
                    camera.x
                ) *
                camera.zoom +
                canvas.width / 2;


            let depositScreenY =
                (
                    bestY *
                    tileSize -
                    camera.y
                ) *
                camera.zoom +
                canvas.height / 2;


            // Deposit radius

            let radius =
                4 +
                random(
                    Math.floor(
                        bestX / spacing
                    ),
                    Math.floor(
                        bestY / spacing
                    ),
                    51
                ) *
                10;


            let circleRadius =
                radius *
                tileSize *
                camera.zoom;


            // At extreme zoom-out make
            // the deposit slightly larger.

            if (camera.zoom < 0.15) {

                circleRadius *= 1.25;
            }


            ctx.beginPath();

            ctx.arc(
                depositScreenX,
                depositScreenY,
                circleRadius,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }
}


// ============================================================
// 10. DRAW ORE
// ============================================================

function drawOre(
    tile,
    x,
    y,
    screenX,
    screenY,
    size
) {

    if (tile.type != "ore")
        return;


    // ========================================================
    // LOD 1 - FULL DETAIL
    // ========================================================

    if (camera.zoom > 0.75) {

        if (tile.ore == "coal")
            ctx.fillStyle = "#333";

        else if (tile.ore == "copper")
            ctx.fillStyle = "orange";

        else
            ctx.fillStyle = "red";


        let circles =
            Math.ceil(
                tile.amount / 100
            );


        ctx.save();

        // Prevent ore from spilling
        // into neighboring tiles

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
    // LOD 2 - ONE CIRCLE PER TILE
    // ========================================================

    if (camera.zoom > 0.35) {

        if (tile.ore == "coal")
            ctx.fillStyle = "#333";

        else if (tile.ore == "copper")
            ctx.fillStyle = "orange";

        else
            ctx.fillStyle = "red";


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

        return;
    }


    // ========================================================
    // LOD 3 - WHOLE DEPOSIT
    // ========================================================

    // Find the center of the deposit
    // using the same deterministic
    // deposit spacing as the generator.

    let spacing = 35;

    let regionX =
        Math.floor(x / spacing);

    let regionY =
        Math.floor(y / spacing);


    let bestDistance = Infinity;

    let bestX = 0;
    let bestY = 0;


    for (
        let ry = regionY - 1;
        ry <= regionY + 1;
        ry++
    ) {

        for (
            let rx = regionX - 1;
            rx <= regionX + 1;
            rx++
        ) {

            let depositX =
                rx * spacing +
                random(rx, ry, 10) * spacing;

            let depositY =
                ry * spacing +
                random(rx, ry, 11) * spacing;


            let dx =
                x - depositX;

            let dy =
                y - depositY;


            let distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (distance < bestDistance) {

                bestDistance = distance;

                bestX = depositX;
                bestY = depositY;
            }
        }
    }


    // Only draw the deposit once.
    //
    // The deposit center is converted
    // into screen coordinates.

    let depositScreenX =
        (bestX * tileSize - camera.x) *
        camera.zoom +
        canvas.width / 2;

    let depositScreenY =
        (bestY * tileSize - camera.y) *
        camera.zoom +
        canvas.height / 2;


    // Don't draw the same deposit
    // multiple times.

    let depositKey =
        Math.floor(bestX / spacing) +
        "," +
        Math.floor(bestY / spacing);


    if (!window.drawnDeposits)
        window.drawnDeposits = new Set();


    if (
        window.drawnDeposits.has(
            depositKey
        )
    )
        return;


    window.drawnDeposits.add(
        depositKey
    );


    // Ore color

    if (tile.ore == "coal")
        ctx.fillStyle = "#333";

    else if (tile.ore == "copper")
        ctx.fillStyle = "orange";

    else
        ctx.fillStyle = "red";


    // Deposit radius

    let radius =
        4 +
        random(
            Math.floor(bestX / spacing),
            Math.floor(bestY / spacing),
            51
        ) * 10;


    let screenRadius =
        radius *
        tileSize *
        camera.zoom *
        0.75;


    // Large deposit circle

    ctx.beginPath();

    ctx.arc(
        depositScreenX,
        depositScreenY,
        screenRadius,
        0,
        Math.PI * 2
    );

    ctx.fill();
}
// ============================================================
// 11. DRAW PLAYER
// ============================================================

function drawPlayer() {

    let x =
        (player.x - camera.x) *
        camera.zoom +
        canvas.width / 2;

    let y =
        (player.y - camera.y) *
        camera.zoom +
        canvas.height / 2;

    let size =
        50 * camera.zoom;


    ctx.fillStyle = "black";

    ctx.fillRect(
        x - size / 2,
        y - size / 2,
        size,
        size
    );
}


// ============================================================
// 12. TOUCH / MOUSE
// ============================================================

let pointers = new Map();

let lastX = 0;
let lastY = 0;

let pinchDistance = null;


canvas.addEventListener(
    "pointerdown",
    e => {

        pointers.set(
            e.pointerId,
            {
                x: e.clientX,
                y: e.clientY
            }
        );


        if (pointers.size == 1) {

            lastX = e.clientX;
            lastY = e.clientY;
        }


        if (pointers.size == 2) {

            let p =
                [...pointers.values()];

            pinchDistance =
                distance(
                    p[0],
                    p[1]
                );
        }
    }
);


canvas.addEventListener(
    "pointermove",
    e => {

        if (!pointers.has(e.pointerId))
            return;


        pointers.set(
            e.pointerId,
            {
                x: e.clientX,
                y: e.clientY
            }
        );


        // Pan

        if (pointers.size == 1) {

            camera.x -=
                (
                    e.clientX -
                    lastX
                ) / camera.zoom;

            camera.y -=
                (
                    e.clientY -
                    lastY
                ) / camera.zoom;


            lastX = e.clientX;
            lastY = e.clientY;
        }


        // Pinch zoom

        if (pointers.size == 2) {

            let p =
                [...pointers.values()];

            let newDistance =
                distance(
                    p[0],
                    p[1]
                );


            if (pinchDistance) {

                camera.zoom *=
                    newDistance /
                    pinchDistance;


                camera.zoom =
                    Math.max(
                        0.2,
                        Math.min(
                            5,
                            camera.zoom
                        )
                    );
            }


            pinchDistance =
                newDistance;
        }
    }
);


canvas.addEventListener(
    "pointerup",
    e => {

        pointers.delete(
            e.pointerId
        );

        pinchDistance = null;


        if (pointers.size == 1) {

            let p =
                [...pointers.values()][0];

            lastX = p.x;
            lastY = p.y;
        }
    }
);


canvas.addEventListener(
    "pointercancel",
    e => {

        pointers.delete(
            e.pointerId
        );

        pinchDistance = null;
    }
);


// ============================================================
// 13. DISTANCE
// ============================================================

function distance(a, b) {

    let dx =
        a.x - b.x;

    let dy =
        a.y - b.y;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}


// ============================================================
// 14. MOUSE WHEEL
// ============================================================

canvas.addEventListener(
    "wheel",
    e => {

        e.preventDefault();


        if (e.deltaY < 0)
            camera.zoom *= 1.1;

        else
            camera.zoom /= 1.1;


        camera.zoom =
            Math.max(
                0.2,
                Math.min(
                    5,
                    camera.zoom
                )
            );

    },
    { passive: false }
);


// ============================================================
// 15. GAME LOOP
// ============================================================

function gameLoop() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawWorld();

    drawPlayer();


    requestAnimationFrame(
        gameLoop
    );
}


gameLoop();