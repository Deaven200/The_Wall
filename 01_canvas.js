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