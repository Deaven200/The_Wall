// ============================================================
// 1. CANVAS
// ============================================================

let canvas = document.getElementById("game");

let ctx =
    canvas.getContext("2d");

canvas.width =
    innerWidth;

canvas.height =
    innerHeight;

canvas.style.touchAction =
    "none";


// ============================================================
// 1A. FILE LOADED
// ============================================================

if (
    typeof window.fileLoaded ==
    "function"
) {

    window.fileLoaded(
        "01_canvas.js"
    );
}
