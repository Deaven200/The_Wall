/* =========================================
   12 - INPUT
========================================= */

let pointers = new Map();

let isPanning = false;

let lastPointerX = 0;
let lastPointerY = 0;

let pinchStartDistance = 0;
let pinchStartZoom = 1;


/* =========================================
   CANVAS TOUCH BEHAVIOR
========================================= */

canvas.style.touchAction = "none";


/* =========================================
   POINTER DOWN
========================================= */

canvas.addEventListener("pointerdown", function(event) {

    /*
        If we are currently placing a building,
        building_ui.js handles the click.

        Do NOT start camera movement.
    */

    if (window.buildMode) {
        return;
    }


    pointers.set(
        event.pointerId,
        {
            x: event.clientX,
            y: event.clientY
        }
    );


    canvas.setPointerCapture(
        event.pointerId
    );


    /* ONE FINGER / MOUSE */

    if (pointers.size === 1) {

        isPanning = true;

        lastPointerX =
            event.clientX;

        lastPointerY =
            event.clientY;
    }


    /* TWO FINGER PINCH */

    if (pointers.size === 2) {

        let values =
            Array.from(pointers.values());

        pinchStartDistance =
            getPointerDistance(
                values[0],
                values[1]
            );

        pinchStartZoom =
            camera.zoom;

        isPanning = false;
    }
});


/* =========================================
   POINTER MOVE
========================================= */

canvas.addEventListener("pointermove", function(event) {

    /*
        Building placement owns the pointer
        while build mode is active.
    */

    if (window.buildMode) {
        return;
    }


    if (!pointers.has(event.pointerId)) {
        return;
    }


    pointers.set(
        event.pointerId,
        {
            x: event.clientX,
            y: event.clientY
        }
    );


    /* TWO FINGER PINCH */

    if (pointers.size === 2) {

        let values =
            Array.from(pointers.values());

        let currentDistance =
            getPointerDistance(
                values[0],
                values[1]
            );


        if (pinchStartDistance > 0) {

            let zoomAmount =
                currentDistance /
                pinchStartDistance;

            camera.zoom =
                pinchStartZoom *
                zoomAmount;


            camera.zoom =
                Math.max(
                    0.2,
                    Math.min(
                        5,
                        camera.zoom
                    )
                );
        }

        return;
    }


    /* ONE POINTER = CAMERA PAN */

    if (
        pointers.size === 1 &&
        isPanning
    ) {

        let dx =
            event.clientX -
            lastPointerX;

        let dy =
            event.clientY -
            lastPointerY;


        camera.x -=
            dx / camera.zoom;

        camera.y -=
            dy / camera.zoom;


        lastPointerX =
            event.clientX;

        lastPointerY =
            event.clientY;
    }
});


/* =========================================
   POINTER UP
========================================= */

canvas.addEventListener("pointerup", function(event) {

    pointers.delete(
        event.pointerId
    );


    if (pointers.size === 0) {

        isPanning = false;

        pinchStartDistance = 0;
    }


    if (pointers.size === 1) {

        let remaining =
            Array.from(
                pointers.values()
            )[0];

        lastPointerX =
            remaining.x;

        lastPointerY =
            remaining.y;

        isPanning = true;
    }
});


/* =========================================
   POINTER CANCEL
========================================= */

canvas.addEventListener("pointercancel", function(event) {

    pointers.delete(
        event.pointerId
    );


    if (pointers.size === 0) {

        isPanning = false;

        pinchStartDistance = 0;
    }
});


/* =========================================
   POINTER LEAVE
========================================= */

canvas.addEventListener("pointerleave", function(event) {

    /*
        Don't delete the pointer here.

        Pointer capture allows dragging to
        continue even if the finger/mouse
        briefly leaves the canvas.
    */
});


/* =========================================
   MOUSE WHEEL ZOOM
========================================= */

canvas.addEventListener("wheel", function(event) {

    event.preventDefault();


    /*
        Don't zoom while building.
    */

    if (window.buildMode) {
        return;
    }


    let zoomAmount =
        event.deltaY > 0
            ? 0.9
            : 1.1;


    camera.zoom *=
        zoomAmount;


    camera.zoom =
        Math.max(
            0.2,
            Math.min(
                5,
                camera.zoom
            )
        );
}, {
    passive: false
});


/* =========================================
   DISTANCE BETWEEN TWO POINTERS
========================================= */

function getPointerDistance(a, b) {

    let dx =
        a.x - b.x;

    let dy =
        a.y - b.y;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}




// ==================================================
// 12B. TAP TO COLLECT ORE
// ==================================================

canvas.addEventListener(
    "pointerdown",
    function(event) {

        // Don't collect ore while building.
        if (window.buildMode) {
            return;
        }

        // Get position inside the canvas.
        let rect =
            canvas.getBoundingClientRect();

        let screenX =
            event.clientX -
            rect.left;

        let screenY =
            event.clientY -
            rect.top;

        // Convert screen position to world pixels.
        let worldPixelX =
            camera.x +
            (
                screenX -
                canvas.width / 2
            ) / camera.zoom;

        let worldPixelY =
            camera.y +
            (
                screenY -
                canvas.height / 2
            ) / camera.zoom;

        // Convert world pixels to tile coordinates.
        let tileX =
            Math.floor(
                worldPixelX / tileSize
            );

        let tileY =
            Math.floor(
                worldPixelY / tileSize
            );

        // Get the tile that was tapped.
        let tile =
            window.getTile(
                tileX,
                tileY
            );

        // ------------------------------------------
        // ONLY ORE CAN BE COLLECTED
        // ------------------------------------------

        if (
            !tile ||
            tile.type !== "ore" ||
            tile.amount <= 0
        ) {
            return;
        }

        // ------------------------------------------
        // TAKE 1 ORE
        // ------------------------------------------

        tile.amount -= 1;

        // ------------------------------------------
        // ADD 1 ORE TO CORE INVENTORY
        // ------------------------------------------

        if (
            !window.core.inventory[tile.ore]
        ) {
            window.core.inventory[tile.ore] = 0;
        }

        window.core.inventory[tile.ore] += 1;
    },
    true
);



/* =========================================
   FILE LOADED
========================================= */

if (typeof window.fileLoaded == "function") {
    window.fileLoaded("12_input.js");
}
