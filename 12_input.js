// ============================================================
// 12. TOUCH / MOUSE
// ============================================================

let pointers =
    new Map();


let lastX = 0;
let lastY = 0;

let pinchDistance = null;


// ============================================================
// 12A. POINTER DOWN
// ============================================================

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


        if (
            pointers.size == 1
        ) {

            lastX =
                e.clientX;

            lastY =
                e.clientY;
        }


        if (
            pointers.size == 2
        ) {

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


// ============================================================
// 12B. POINTER MOVE
// ============================================================

canvas.addEventListener(
    "pointermove",
    e => {

        if (
            !pointers.has(
                e.pointerId
            )
        )
            return;


        pointers.set(
            e.pointerId,
            {
                x: e.clientX,
                y: e.clientY
            }
        );


        // Pan

        if (
            pointers.size == 1
        ) {

            camera.x -=
                (
                    e.clientX -
                    lastX
                ) /
                camera.zoom;


            camera.y -=
                (
                    e.clientY -
                    lastY
                ) /
                camera.zoom;


            lastX =
                e.clientX;

            lastY =
                e.clientY;
        }


        // Pinch zoom

        if (
            pointers.size == 2
        ) {

            let p =
                [...pointers.values()];


            let newDistance =
                distance(
                    p[0],
                    p[1]
                );


            if (
                pinchDistance
            ) {

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


// ============================================================
// 12C. POINTER UP
// ============================================================

canvas.addEventListener(
    "pointerup",
    e => {

        pointers.delete(
            e.pointerId
        );


        pinchDistance =
            null;


        if (
            pointers.size == 1
        ) {

            let p =
                [...pointers.values()][0];


            lastX =
                p.x;

            lastY =
                p.y;
        }
    }
);


// ============================================================
// 12D. POINTER CANCEL
// ============================================================

canvas.addEventListener(
    "pointercancel",
    e => {

        pointers.delete(
            e.pointerId
        );


        pinchDistance =
            null;
    }
);


// ============================================================
// 12E. DISTANCE
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
// 12F. MOUSE WHEEL
// ============================================================

canvas.addEventListener(
    "wheel",
    e => {

        e.preventDefault();


        if (
            e.deltaY < 0
        )
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
    {
        passive: false
    }
);